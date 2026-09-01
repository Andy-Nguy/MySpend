# Phase 1 — Authentication & Profile Management: Complete Flow Summary

> **Project**: MySpend — Personal Expense Tracker  
> **Stack**: Nx 21 Monorepo | NestJS 11 (service) | React 19 + Vite (client) | PostgreSQL + TypeORM 0.3.x | Supabase Auth  
> **Status**: ✅ Complete — Pushed to `main`  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema & Migrations](#2-database-schema--migrations)
3. [Shared Library (`@myspend/libs`)](#3-shared-library-hr-systemslibs)
4. [Backend — Authentication Module](#4-backend--authentication-module)
5. [Backend — Profiles Module](#5-backend--profiles-module)
6. [Frontend — Token & Session Management](#6-frontend--token--session-management)
7. [Frontend — Auth Pages & Components](#7-frontend--auth-pages--components)
8. [Frontend — Profile Page](#8-frontend--profile-page)
9. [Full Flow Diagrams](#9-full-flow-diagrams)
10. [API Reference](#10-api-reference)
11. [Security Considerations](#11-security-considerations)
12. [What's Next (Phase 2 Candidates)](#12-whats-next-phase-2-candidates)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Nx Monorepo                              │
│                                                                 │
│   ┌──────────────────┐        ┌────────────────────────────┐   │
│   │  apps/client     │        │  apps/service              │   │
│   │  React 19 + Vite │◄──────►│  NestJS 11                 │   │
│   │  Ant Design v5   │  HTTP  │  TypeORM 0.3.x             │   │
│   │  :4200           │        │  Passport JWT              │   │
│   └──────────────────┘        │  :3000/api                 │   │
│                               └────────────┬───────────────┘   │
│   ┌──────────────────┐                     │                   │
│   │  libs/           │        ┌────────────▼───────────────┐   │
│   │  @myspend/libs│        │  Supabase Auth             │   │
│   │  IProfile, enums │        │  (identity provider)       │   │
│   └──────────────────┘        └────────────────────────────┘   │
│                                            │                   │
│                               ┌────────────▼───────────────┐   │
│                               │  PostgreSQL                 │   │
│                               │  (profiles table)          │   │
│                               └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**

| Decision | Choice | Reason |
|---|---|---|
| Identity Provider | Supabase Auth | Handles password hashing, email verification, OAuth readiness |
| Token strategy | Dual JWT (access + refresh) | Short-lived access token (memory), long-lived refresh in HttpOnly cookie |
| Access token storage | In-memory (`tokenStore.ts`) | Immune to XSS; not stored in localStorage |
| Refresh token storage | HttpOnly cookie (`path=/api/auth`) | CSRF-limited scope; inaccessible to JS |
| Database | PostgreSQL via TypeORM | `synchronize: false`, schema controlled via migrations |
| Global auth guard | `JwtAuthGuard` as `APP_GUARD` | All routes protected by default; opt-out via `@Public()` |

---

## 2. Database Schema & Migrations

### Final `profiles` Table Schema

```sql
CREATE TABLE "profiles" (
  "id"             uuid NOT NULL,              -- Supabase Auth user UUID (PK)
  "email"          text NOT NULL,              -- Unique email address
  "first_name"     varchar(100),
  "last_name"      varchar(100),
  "display_name"   varchar(200),
  "mobile_number"  varchar(20),
  "date_of_birth"  date,
  "avatar_url"     text,
  "created_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "deleted_at"     TIMESTAMPTZ,               -- Soft delete
  "created_by"     uuid,
  "updated_by"     uuid,
  "deleted_by"     uuid,
  CONSTRAINT "UQ_profiles_email" UNIQUE ("email"),
  CONSTRAINT "PK_profiles_id"    PRIMARY KEY ("id")
);
```

> **Note**: `id` is sourced directly from Supabase Auth — the same UUID is used as the PK in our local `profiles` table, creating a 1-to-1 link without foreign key constraints.

### Migration History

| File | Applied | Description |
|---|---|---|
| `20260830000000-create-profiles.ts` | ✅ | Initial table: `id`, `email`, timestamps |
| `20260831163000-add-audit-columns-to-profiles.ts` | ✅ | Added `created_by`, `updated_by`, `deleted_by`, `deleted_at` |
| `20260831170000-add-personal-columns-to-profiles.ts` | ✅ | Added `first_name`, `last_name`, `display_name`, `mobile_number`, `date_of_birth`, `avatar_url` |

---

## 3. Shared Library (`@myspend/libs`)

Located at `libs/src/lib/`. Re-exported through `libs/src/lib/libs.ts`.

### `IBaseEntity` (`types/base.types.ts`)

```typescript
export interface IBaseEntity {
  id: string | number;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
}
```

### `IProfile` (`types/profile.types.ts`)

```typescript
export interface IProfile extends IBaseEntity {
  id: string;           // UUID — matches Supabase Auth user ID
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  mobileNumber?: string | null;
  dateOfBirth?: Date | string | null;
  avatarUrl?: string | null;
}
```

Both `ProfileEntity` (service) and `IAuthUser` (client) implement/extend `IProfile`, ensuring type consistency across the monorepo.

---

## 4. Backend — Authentication Module

**Location**: `apps/service/src/auth/`

### 4.1 Module Wiring (`auth.module.ts`)

```
AuthModule
  imports: [PassportModule, JwtModule.register({}), TypeOrmModule.forFeature([ProfileEntity])]
  controllers: [AuthController]
  providers: [AuthService, JwtStrategy, ProfilesRepository]
```

### 4.2 JWT Strategy (`strategies/jwt.strategy.ts`)

- Extracts Bearer token from `Authorization` header
- Verifies against `JWT_SECRET` (from config)
- Injects `{ userId: sub, email }` into `request.user`

### 4.3 JWT Auth Guard (`guards/jwt-auth.guard.ts`)

- Registered globally as `APP_GUARD` in `AppModule`
- All routes are **protected by default**
- Routes decorated with `@Public()` bypass the guard

### 4.4 Auth Controller (`auth.controller.ts`)

| Method | Endpoint | Guard | Rate Limit | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | `@Public()` | 20 req/hr | Register new user |
| `POST` | `/api/auth/login` | `@Public()` | 30 req/min | Login existing user |
| `POST` | `/api/auth/refresh` | `@Public()` | 60 req/min | Refresh access token using HttpOnly cookie |
| `POST` | `/api/auth/logout` | `@Public()` | Default | Clear refresh token cookie |
| `GET` | `/api/auth/me` | JWT required | Default | Get authenticated user's profile |

All auth endpoints are wrapped with `ThrottlerGuard` at the controller level.

**Refresh token cookie config:**
```typescript
{
  httpOnly: true,
  secure: isProduction,             // HTTPS only in prod
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth',                // Scoped to auth endpoints only
}
```

### 4.5 Auth Service (`auth.service.ts`)

#### `register(email, password)`

```
1. Normalize email (trim + lowercase)
2. Use Supabase Admin Client (if available) to create user with email_confirm: true
   └─ Fallback: use Supabase Auth Client (signUp), user may be unconfirmed
3. Call profilesRepository.upsertFromSupabaseUser(user) → create local profile row
4. Call createSession(profile) → return { accessToken, refreshToken, user }
```

#### `login(email, password)`

```
1. Normalize email
2. Supabase signInWithPassword
3. If "email not confirmed" error → auto-confirm via Admin Client + retry
4. Call profilesRepository.upsertFromSupabaseUser(user) → sync profile
5. Call createSession(profile) → return { accessToken, refreshToken, user }
```

#### `refresh(refreshToken)`

```
1. Verify refresh token JWT (separate secret: JWT_REFRESH_SECRET)
2. Check tokenType === 'refresh'
3. Look up profile by sub (userId)
4. Call createSession(profile) → issue new token pair
```

#### `createSession(profile)` — private

```
Parallel JWT sign:
  accessToken:  { sub, email } | JWT_SECRET     | expiresIn: JWT_EXPIRES_IN
  refreshToken: { sub, tokenType: 'refresh' }   | JWT_REFRESH_SECRET | JWT_REFRESH_EXPIRES_IN
```

### 4.6 Profiles Repository (auth dependency)

`ProfilesRepository.upsertFromSupabaseUser(user)`:
1. Check if profile exists by UUID → return / update email if changed
2. Check for email collision (old profile with different UUID) → delete old row
3. Create new profile row with Supabase UUID as PK

---

## 5. Backend — Profiles Module

**Location**: `apps/service/src/profiles/`

### 5.1 Profiles Controller (`profiles.controller.ts`)

All endpoints require a valid JWT (inherited from global `JwtAuthGuard`).

| Method | Endpoint | Description |
|---|---|---|
| `PATCH` | `/api/profiles/me` | Update personal info |
| `POST` | `/api/profiles/me/change-password` | Change password (verify current first) |

### 5.2 Update Profile (`updateProfile`)

```
PATCH /api/profiles/me
Authorization: Bearer <accessToken>

Body (UpdateProfileDto — all optional):
{
  firstName?: string (max 100)
  lastName?: string (max 100)
  displayName?: string (max 200)
  mobileNumber?: string (max 20)
  dateOfBirth?: string (ISO 8601 date: YYYY-MM-DD)
  avatarUrl?: string (valid URL)
}

Flow:
1. Validate JWT → extract userId from request.user
2. findById(userId) → 404 if not found
3. repository.updateProfile(userId, { ...dto, updatedBy: userId })
4. Return updated ProfileEntity
```

### 5.3 Change Password (`changePassword`)

```
POST /api/profiles/me/change-password
Authorization: Bearer <accessToken>

Body (ChangePasswordDto):
{
  currentPassword: string (min 6)
  newPassword: string (min 6)
}

Flow:
1. findById(userId) → 404 if not found
2. Supabase signInWithPassword(email, currentPassword) → 401 if wrong
3. Admin Client available:
   └─ adminClient.auth.admin.updateUserById(userId, { password: newPassword })
   Fallback:
   └─ Sign in again → get session → authenticatedClient.auth.updateUser({ password: newPassword })
4. Return { success: true, message: 'Password updated successfully' }
```

### 5.4 Profiles Repository (`repository/profiles.repository.ts`)

```typescript
// Injectable, injected with @InjectRepository(ProfileEntity)
// Does NOT extend Repository<T>

upsertFromSupabaseUser(user)   // Create or sync profile on auth
findById(id: string)           // Find by UUID
findByEmail(email: string)     // Find by normalized email
updateProfile(id, updates)     // Update + return fresh entity
```

---

## 6. Frontend — Token & Session Management

### 6.1 Token Store (`services/tokenStore.ts`)

```typescript
// In-memory singleton — NOT localStorage, immune to XSS
let accessToken: string | null = null;

export const tokenStore = {
  getAccessToken(),   // Read
  setAccessToken(token),  // Store
  clearAccessToken(), // Wipe
};
```

### 6.2 API Client (`services/api.service.ts`)

```typescript
// Axios instance
baseURL: VITE_API_URL || 'http://localhost:3000/api'
withCredentials: true  // Sends HttpOnly refresh cookie automatically
```

**Request Interceptor**: Attaches `Authorization: Bearer <token>` from `tokenStore` on every request.

**Response Interceptor (401 handling — silent token refresh)**:

```
On 401 response:
  Skip if: auth endpoint (login/register/logout/refresh)
  If already refreshing: queue request → resolve/reject when refresh completes
  Otherwise:
    1. Mark _retry = true (prevent infinite loop)
    2. POST /auth/refresh (browser sends HttpOnly cookie automatically)
    3. On success: update tokenStore, retry original request
    4. On failure: clearAccessToken + dispatch 'auth:unauthorized' event
```

### 6.3 Auth Context (`context/AuthContext.tsx`)

**State**: `user: IAuthUser | null`, `loading: boolean`

**Session Recovery (on app load)**:
```
useEffect → POST /auth/refresh
  Success: applySession(data) → store token + set user
  Failure: clear token + set user = null
  Finally: setLoading(false) → unblock UI
```

**Event Listener**: Listens for `auth:unauthorized` window event (fired by `api.service.ts` interceptor) → clears user state for automatic logout.

**Exposed via `useAuth()` hook**:

| Property/Method | Type | Description |
|---|---|---|
| `user` | `IAuthUser \| null` | Current authenticated user |
| `loading` | `boolean` | True while recovering session |
| `isAuthenticated` | `boolean` | `Boolean(user)` |
| `login(email, password)` | `Promise<void>` | POST /auth/login → applySession |
| `register(email, password)` | `Promise<void>` | POST /auth/register → applySession |
| `logout()` | `Promise<void>` | POST /auth/logout → clear token + user |
| `updateUserProfile(partial)` | `void` | Merge partial update into user state |

---

## 7. Frontend — Auth Pages & Components

### 7.1 Routes (`consts/routes.ts`)

```typescript
export enum AppRoutes {
  HOME     = '/',
  LOGIN    = '/login',
  REGISTER = '/register',
  PROFILE  = '/profile',
}
```

### 7.2 Route Protection (`components/ProtectedRoute.tsx`)

```
ProtectedRoute behavior:
  loading=true  → render null (invisible splash, wait for session recovery)
  !isAuthenticated → <Navigate to="/login" state={{ from: location }} />
  isAuthenticated → <Outlet /> (render child route)
```

**Protected routes**: `/` (Dashboard), `/profile`  
**Public routes**: `/login`, `/register`

### 7.3 Login Page (`pages/Login.tsx`)

```
1. Render AuthLayout (branded card)
2. antd Form with:
   - Email field: required + email format validation
   - Password field: required + min 6 chars
   - "Forgot password?" button (placeholder — coming soon)
3. Submit → useAuth().login(email, password)
   Success → message.success → navigate to originally requested path or HOME
   Error   → formatAuthErrorMessage() → display antd Alert banner + message.error
4. If already isAuthenticated → redirect to HOME immediately
```

### 7.4 Register Page (`pages/Register.tsx`)

```
1. Same AuthLayout
2. antd Form:
   - Email field
   - Password field (min 6)
   - Confirm password field (must match)
3. Submit → useAuth().register(email, password)
   Success → navigate to /profile with { state: { isNewUser: true } }
   Error   → display Alert banner
```

### 7.5 Auth Layout & Inputs

- `components/auth/AuthLayout.tsx` — branded card with logo, title, subtitle
- `components/auth/AuthInput.tsx` — styled `AuthTextInput` / `AuthPasswordInput` wrappers

---

## 8. Frontend — Profile Page

**Location**: `pages/Profile.tsx`  
**Route**: `/profile` (protected)

### 8.1 Two Modes

| Mode | Trigger | Behavior |
|---|---|---|
| **Onboarding** | Navigate with `state: { isNewUser: true }` | Shows welcome alert; back button says "Skip for now"; submit button says "Save & Continue to Dashboard"; hides Change Password section |
| **Account Settings** | Normal navigation | Shows "Back to Dashboard"; submit says "Save Changes"; shows Change Password card |

### 8.2 Profile Header Card

Displays: avatar (from `avatarUrl` or default icon), display name / full name / email fallback, email, "Verified Account" badge.

### 8.3 Form 1: Personal Information

```
Fields (all optional):
  firstName     (Input, max 100)
  lastName      (Input, max 100)
  displayName   (Input, max 200)
  mobileNumber  (Input with phone icon, regex validation)
  dateOfBirth   (DatePicker, format YYYY-MM-DD)
  avatarUrl     (Input, URL validation)
  email         (Input, DISABLED — read-only)

Submit:
  profileService.updateProfile(payload) → PATCH /api/profiles/me
  Success → updateUserProfile(updated) → refresh AuthContext user state
  isNewUser → navigate to HOME; else → show success message
```

### 8.4 Form 2: Security & Password (existing users only)

```
Fields:
  currentPassword  (required)
  newPassword      (required, min 6)
  confirmNewPassword (must match newPassword — client-side validation)

Submit:
  profileService.changePassword({ currentPassword, newPassword })
  → POST /api/profiles/me/change-password
  Success → message.success + passwordForm.resetFields()
  Error   → message.error with server error message
```

### 8.5 Profile Service (`services/profile.service.ts`)

```typescript
profileService.updateProfile(data: IUpdateProfileData): Promise<IAuthUser>
  → PATCH /api/profiles/me

profileService.changePassword(data: IChangePasswordData): Promise<{ success, message }>
  → POST /api/profiles/me/change-password
```

---

## 9. Full Flow Diagrams

### 9.1 Registration Flow

```
User fills Register form
    │
    ▼
useAuth().register(email, password)
    │
    ▼
POST /api/auth/register
    │
    ▼
AuthService.register()
    ├─ Supabase Admin: createUser({ email, password, email_confirm: true })
    │  └─ Fallback: supabase.auth.signUp()
    │
    ▼
profilesRepository.upsertFromSupabaseUser(supabaseUser)
    │  ← Creates row in profiles table (id = Supabase UUID)
    │
    ▼
createSession(profile)
    ├─ JWT access token  (in-memory on client)
    └─ JWT refresh token (HttpOnly cookie, 7 days)
    │
    ▼
Client: applySession(data)
    ├─ tokenStore.setAccessToken(accessToken)
    └─ setUser(user)
    │
    ▼
navigate('/profile', { state: { isNewUser: true } })
```

### 9.2 Login Flow

```
User fills Login form
    │
    ▼
useAuth().login(email, password)
    │
    ▼
POST /api/auth/login
    │
    ▼
AuthService.login()
    ├─ supabase.auth.signInWithPassword()
    ├─ [If "email not confirmed"] → adminClient.auth.admin.updateUserById(email_confirm: true) → retry
    │
    ▼
profilesRepository.upsertFromSupabaseUser(user)
    │  ← Sync local profile (handles email changes)
    │
    ▼
createSession(profile) → { accessToken, refreshToken, user }
    │
    ▼
Client: applySession → navigate to HOME (or originally requested path)
```

### 9.3 Session Recovery (App Startup)

```
App loads → AuthProvider mounts
    │
    ▼
AuthContext useEffect → POST /api/auth/refresh
    │  ← Browser automatically sends HttpOnly refreshToken cookie
    │
    ├─ Success:
    │    applySession(data) → user logged in silently
    │    setLoading(false)
    │
    └─ Failure:
         clearAccessToken()
         setUser(null)
         setLoading(false) → ProtectedRoute redirects to /login
```

### 9.4 Silent Token Refresh (API Interceptor)

```
Any API request fails with 401
    │
    ▼
api.service.ts response interceptor
    │
    ├─ Skip if: it's an auth endpoint itself
    ├─ If already refreshing: queue request → wait for refresh result
    │
    └─ Otherwise:
         POST /api/auth/refresh
             │
             ├─ Success:
             │    tokenStore.setAccessToken(newToken)
             │    Retry ALL queued + original requests with new token
             │
             └─ Failure:
                  clearAccessToken()
                  dispatch('auth:unauthorized') window event
                  AuthContext listener → setUser(null) → UI shows login
```

### 9.5 Update Profile Flow

```
User edits Profile form → clicks "Save Changes"
    │
    ▼
handleUpdateProfile(formValues)
    │
    ▼
profileService.updateProfile(payload)
    │
    ▼
PATCH /api/profiles/me (with Bearer token)
    │
    ▼
ProfilesController.updateProfile()
    │
    ▼
ProfilesService.updateProfile(userId, dto)
    ├─ findById(userId) → 404 if missing
    └─ repository.updateProfile(userId, { ...dto, updatedBy: userId })
    │
    ▼
Returns updated ProfileEntity
    │
    ▼
updateUserProfile(updated) → merges into AuthContext user state
    │
    ▼
message.success / navigate to HOME if isNewUser
```

### 9.6 Change Password Flow

```
User fills Change Password form → clicks "Update Password"
    │
    ▼
handleChangePassword({ currentPassword, newPassword })
    │
    ▼
profileService.changePassword(data)
    │
    ▼
POST /api/profiles/me/change-password (with Bearer token)
    │
    ▼
ProfilesService.changePassword(userId, dto)
    ├─ findById(userId) → 404 if missing
    ├─ supabase.signInWithPassword(email, currentPassword) → 401 if wrong
    └─ Admin Client: updateUserById(userId, { password: newPassword })
       └─ Fallback: authenticated session → updateUser({ password: newPassword })
    │
    ▼
Returns { success: true, message: 'Password updated successfully' }
    │
    ▼
message.success + passwordForm.resetFields()
```

---

## 10. API Reference

### Base URL
```
Development: http://localhost:3000/api
Swagger UI:  http://localhost:3000/api/docs
```

### Auth Endpoints

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/auth/register` | Public | `{ email, password }` | `{ accessToken, user }` + cookie |
| `POST` | `/auth/login` | Public | `{ email, password }` | `{ accessToken, user }` + cookie |
| `POST` | `/auth/refresh` | Public (cookie) | — | `{ accessToken, user }` + new cookie |
| `POST` | `/auth/logout` | Public | — | `{ success: true }` |
| `GET` | `/auth/me` | Bearer JWT | — | `ProfileEntity` |

### Profile Endpoints

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| `PATCH` | `/profiles/me` | Bearer JWT | `UpdateProfileDto` (all optional) | Updated `ProfileEntity` |
| `POST` | `/profiles/me/change-password` | Bearer JWT | `{ currentPassword, newPassword }` | `{ success, message }` |

### Error Responses

```json
// 400 Bad Request
{ "statusCode": 400, "message": "...", "error": "Bad Request" }

// 401 Unauthorized
{ "statusCode": 401, "message": "Invalid credentials" }

// 404 Not Found
{ "statusCode": 404, "message": "Profile not found" }

// 429 Too Many Requests
{ "statusCode": 429, "message": "ThrottlerException: Too Many Requests" }
```

---

## 11. Security Considerations

| Area | Implementation |
|---|---|
| **Access token storage** | In-memory only (JavaScript variable) — no localStorage, no sessionStorage |
| **Refresh token storage** | HttpOnly cookie — inaccessible to JavaScript |
| **Cookie scope** | `path: '/api/auth'` — only sent with auth requests, not every API call |
| **Cookie security** | `secure: true` + `sameSite: 'none'` in production; `lax` in development |
| **Rate limiting** | `ThrottlerModule` global (60/min) + per-endpoint overrides (stricter for auth) |
| **Password verification** | Change password requires proof of current password via Supabase re-auth |
| **Email normalization** | Emails always lowercased + trimmed before storage/lookup |
| **Global JWT guard** | All routes protected by default — must explicitly opt-out with `@Public()` |
| **Auto email confirm** | Admin Client auto-confirms users on register (no email verification required in dev) |
| **Input validation** | NestJS `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true` |

---

## 12. What's Next (Phase 2 Candidates)

The foundation is solid. Here are the logical next features:

### 🔴 High Priority
- [ ] **Expense CRUD** — Core feature: create, list, edit, delete expense entries
- [ ] **Category Management** — Predefined + custom expense categories
- [ ] **Dashboard Stats** — Total spending, monthly trend, breakdown by category

### 🟡 Medium Priority  
- [ ] **Budget Limits** — Set monthly budget per category with alerts
- [ ] **Date Range Filtering** — Filter expenses by custom date ranges
- [ ] **Search & Sort** — Search expenses by description, sort by amount/date

### 🟢 Nice to Have
- [ ] **Avatar Upload** — File upload to Supabase Storage (replace URL input)
- [ ] **Forgot Password** — Email-based password reset via Supabase
- [ ] **OAuth Login** — Google/GitHub social login (Supabase supports this)
- [ ] **Export** — Export expenses as CSV / PDF
- [ ] **Multi-currency Support** — Store and display in user's preferred currency

---

## File Map

```
MySpend/
├── libs/src/lib/
│   ├── libs.ts                          # Barrel re-exports
│   ├── types/
│   │   ├── base.types.ts                # IBaseEntity
│   │   └── profile.types.ts             # IProfile extends IBaseEntity
│   └── enums/
│       └── api-routes.enum.ts
│
├── apps/service/src/
│   ├── main.ts                          # Bootstrap, Swagger, CORS, cookie-parser
│   ├── app.module.ts                    # Root module: TypeORM, ThrottlerModule, global guards
│   ├── config/configuration.ts          # Typed config factory
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts           # register, login, refresh, logout, me
│   │   ├── auth.service.ts              # Supabase integration, JWT creation
│   │   ├── dto/auth.dto.ts              # AuthCredentialsDto
│   │   ├── strategies/jwt.strategy.ts   # Passport JWT strategy
│   │   ├── guards/jwt-auth.guard.ts     # @Public() aware guard
│   │   └── decorators/public.decorator.ts
│   │
│   ├── profiles/
│   │   ├── profiles.module.ts
│   │   ├── profiles.controller.ts       # PATCH /me, POST /me/change-password
│   │   ├── profiles.service.ts          # updateProfile, changePassword
│   │   ├── repository/profiles.repository.ts
│   │   └── dto/
│   │       ├── update-profile.dto.ts
│   │       └── change-password.dto.ts
│   │
│   ├── entities/profile/
│   │   └── profile.entity.ts            # TypeORM entity implements IProfile
│   │
│   └── migrations/
│       ├── 20260830000000-create-profiles.ts
│       ├── 20260831163000-add-audit-columns-to-profiles.ts
│       └── 20260831170000-add-personal-columns-to-profiles.ts
│
└── apps/client/src/
    ├── App.tsx                           # Routes + AuthProvider + antd ConfigProvider
    ├── consts/routes.ts                  # AppRoutes enum
    │
    ├── context/
    │   └── AuthContext.tsx              # useAuth hook, session recovery, event listener
    │
    ├── services/
    │   ├── api.service.ts               # Axios instance + 401 interceptor + silent refresh
    │   ├── tokenStore.ts                # In-memory access token store
    │   └── profile.service.ts           # updateProfile, changePassword API calls
    │
    ├── components/
    │   ├── ProtectedRoute.tsx           # Route guard component
    │   └── auth/
    │       ├── AuthLayout.tsx           # Branded auth card layout
    │       └── AuthInput.tsx            # Styled input wrappers
    │
    └── pages/
        ├── Login.tsx
        ├── Register.tsx
        ├── Dashboard.tsx
        └── Profile.tsx                  # Onboarding + Account Settings modes
```
