# 🏗️ Monorepo Project Architecture Blueprint

> **Mục đích:** File này mô tả toàn bộ cấu trúc, quy ước, và kiến trúc của một monorepo production-ready.
> Khi setup project mới tương tự, AI chỉ cần đọc file này để tái tạo lại đúng cấu trúc ban đầu.

---

## 1. Tech Stack

| Layer                     | Technology                                                 | Version     |
| :------------------------ | :--------------------------------------------------------- | :---------- |
| **Monorepo Manager**      | Nx                                                         | `^21`       |
| **Backend Framework**     | NestJS                                                     | `^11`       |
| **Frontend Framework**    | React                                                      | `^19`       |
| **Frontend Build Tool**   | Vite                                                       | `^7`        |
| **UI Component Library**  | Ant Design (`antd`)                                        | `^5`        |
| **Dynamic Styling**       | styled-components                                          | `5.3.x`     |
| **Database**              | PostgreSQL                                                 | -           |
| **ORM**                   | TypeORM                                                    | `^0.3.x`    |
| **Auth Provider**         | Supabase (OAuth gateway only) + Custom JWT                 | -           |
| **State Management (FE)** | Zustand + TanStack Query                                   | `^5` / `^5` |
| **HTTP Client (FE)**      | Axios                                                      | `^1`        |
| **Validation (BE)**       | class-validator + class-transformer                        | -           |
| **Mail**                  | nodemailer + @nestjs-modules/mailer (Handlebars templates) | -           |
| **File Storage**          | Supabase Storage                                           | -           |
| **Scheduled Jobs**        | @nestjs/schedule                                           | -           |
| **API Docs**              | Swagger (@nestjs/swagger)                                  | -           |
| **Language**              | TypeScript                                                 | `~5.9`      |

---

## 2. Cấu trúc Thư mục Root (Monorepo)

```
<project-root>/
├── apps/
│   ├── client/                 # React frontend (Vite)
│   └── service/                # NestJS backend
├── libs/
│   └── src/
│       ├── index.ts            # Barrel export duy nhất
│       └── lib/
│           ├── libs.ts         # Re-export TẤT CẢ từ enums/, types/, utils/, consts/
│           ├── enums/          # Domain enums (ALL enums sống tại đây)
│           ├── types/          # Shared interfaces & DTO interfaces
│           ├── utils/          # Pure utility functions dùng chung BE + FE
│           └── consts/         # Shared constants
├── database/
│   └── migration/              # Raw SQL migration scripts (lịch sử)
├── tsconfig.base.json          # Path alias @hr-systems/libs → libs/src/index.ts
├── nx.json                     # Nx workspace config
├── package.json                # Root package.json (single node_modules)
└── docker-compose.yml
```

---

## 3. Shared Library (`@hr-systems/libs`)

### 3.1 Path Alias (tsconfig.base.json)

```json
{
  "paths": {
    "@hr-systems/libs": ["libs/src/index.ts"],
    "@hr-systems/libs/*": ["libs/src/lib/*"]
  }
}
```

Cả BE và FE đều import từ `@hr-systems/libs` — **không bao giờ import cross-app**.

### 3.2 Cấu trúc `libs/src/lib/`

```
libs/src/lib/
├── libs.ts              ← PHẢI re-export TẤT CẢ files bên dưới
├── enums/
│   ├── api-routes.enum.ts
│   ├── auth.enum.ts
│   ├── comment.enum.ts
│   ├── late-early.enum.ts
│   ├── leave-request.enum.ts
│   ├── permission-enum.ts    ← PermissionNameEnum (RBAC)
│   ├── profile.enum.ts
│   ├── role.enum.ts
│   └── ...
├── types/
│   ├── base.types.ts         ← IBaseEntity (id, createdAt, updatedAt, deletedAt)
│   ├── auth.types.ts
│   ├── profile.types.ts      ← IProfile
│   ├── leave-request.types.ts
│   ├── jwt-user.types.ts     ← IJwtUser, IJwtPayload
│   ├── util.types.ts         ← CamelToSnake<T>, generic helpers
│   └── ...
├── utils/
│   ├── object.util.ts        ← objectSnakeToCamel(), objectCamelToSnake()
│   ├── date-formater.ts
│   ├── period.util.ts
│   └── ...
└── consts/
    └── leave-request.const.ts
```

### 3.3 Quy tắc libs.ts (QUAN TRỌNG)

```typescript
// libs/src/lib/libs.ts — PHẢI re-export HẾT
export * from "./enums/profile.enum";
export * from "./enums/late-early.enum";
// ... tất cả enums
export * from "./types/base.types";
export * from "./types/profile.types";
// ... tất cả types
export * from "./utils/object.util";
// ... tất cả utils
export * from "./consts/leave-request.const";
```

---

## 4. Naming Conventions (BẮT BUỘC)

### 4.1 File Names

- **kebab-case** cho tất cả files: `leave-request.service.ts`, `LeaveRequestDialog.tsx`, `useHoliday.ts`

### 4.2 Interfaces & Types

| Pattern       | Ví dụ                                                     |
| :------------ | :-------------------------------------------------------- |
| Interface     | `IProfile`, `ILeaveRequest` (prefix `I`)                  |
| DTO Interface | `ICreateLeaveRequestDto`, `IUpdateLeaveRequestDto`        |
| Enum          | `LateEarlyTypeEnum`, `PermissionNameEnum` (suffix `Enum`) |

### 4.3 Enum Members (BẮT BUỘC)

```typescript
// ĐÚNG: UPPER_SNAKE_CASE key với 'lower_snake_case' string value
export enum LateEarlyTypeEnum {
  EARLY = "early",
  LATE = "late",
}

export enum ReasonCategoryEnum {
  PERSONAL = "personal",
  PROJECT_WORK = "project_work",
}
```

### 4.4 CRITICAL ENUM RULE

> ❌ **TUYỆT ĐỐI KHÔNG** định nghĩa domain enum trong `apps/client` hoặc `apps/service`.
> ✅ **TẤT CẢ** domain enums phải ở `libs/src/lib/enums/` và được re-export trong `libs.ts`.

---

## 5. Backend (NestJS) — `apps/service/`

### 5.1 Cấu trúc Module

```
apps/service/src/
├── main.ts                    # Bootstrap: CORS, Cookie, Swagger, Seeding
├── app.module.ts              # Root module: TypeORM, Guards global, EventEmitter
├── config/
│   └── configuration.ts       # ConfigModule factory (env vars mapping)
├── data-source.ts             # TypeORM DataSource CHỈ cho CLI (migration:generate)
├── entities/                  # TypeORM Entities (theo feature)
│   ├── profiles/
│   │   ├── profile.entity.ts
│   │   └── profile-professional.entity.ts
│   ├── leave-requests/
│   │   └── leave-request.entity.ts
│   └── ...
├── guards/
│   ├── jwt-auth.guard.ts      # JwtAuthGuard (global trong app.module)
│   └── permissions.guard.ts   # PermissionsGuard (per-controller/endpoint)
├── decorators/
│   ├── check-permissions.decorator.ts   # @CheckPermissions([PermissionNameEnum.XXX])
│   └── public.decorator.ts             # @Public() để skip JWT guard
├── migrations/                # TypeORM migration files (YYYYMMDDHHMMSS-description.ts)
├── database/
│   └── seeds/                 # Seed functions (permissions, super admin)
├── listeners/                 # EventEmitter listeners (mail side-effects)
│   ├── leave-mail.listener.ts
│   ├── late-early-mail.listener.ts
│   └── index.ts
├── mail/                      # MailModule (nodemailer + Handlebars templates)
│   ├── events.service.ts      # emitLeaveEvent(), emitLateEarlyEvent()
│   └── templates/
│       ├── employee/
│       ├── leader/
│       ├── hr/
│       └── partials/
├── supabase/
│   └── supabase.module.ts     # Provide SUPABASE_CLIENT token
├── storage/
│   └── supabase-storage.provider.ts
├── auth/                      # Feature module
├── profiles/
├── leave-requests/
├── leave-approval/
├── late-early/
└── ...                        # Các feature modules khác
```

### 5.2 Feature Module Structure (Chuẩn)

Mỗi feature nằm trong `apps/service/src/<feature>/`:

```
<feature>/
├── <feature>.module.ts        # @Module({ imports, controllers, providers })
├── <feature>.controller.ts    # REST endpoints + Swagger decorators
├── <feature>.service.ts       # Business logic, sử dụng NestJS Logger
├── dto/
│   ├── create-<feature>.dto.ts
│   ├── update-<feature>.dto.ts
│   └── query-<feature>.dto.ts
└── repository/
    └── <feature>.repository.ts # Custom repository (KHÔNG extend Repository<T>)
```

### 5.3 Entity Convention

```typescript
// apps/service/src/entities/<feature>/<feature>.entity.ts
@Entity({ name: "table_name_snake_case" })
export class FeatureName implements IFeatureName {
  // PHẢI implements shared interface
  @PrimaryGeneratedColumn("identity") // int PK
  id: number;
  // HOẶC:
  @PrimaryColumn({ type: "uuid" }) // UUID PK
  id: string;

  @Column({ name: "snake_case_column_name" }) // Luôn map explicit column name
  camelCaseProperty: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at" }) // Soft delete
  deletedAt?: Date;
}
```

### 5.4 Repository Pattern

```typescript
// KHÔNG extends Repository<T>
@Injectable()
export class FeatureRepository {
  constructor(
    @InjectRepository(FeatureEntity)
    private readonly repo: Repository<FeatureEntity>,
  ) {}

  async findById(id: number): Promise<FeatureEntity | null> {
    return this.repo.findOne({ where: { id } });
  }
}
```

### 5.5 Controller Convention

```typescript
@Controller('feature')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiTags('Feature')
@ApiBearerAuth('JWT-auth')
export class FeatureController {
  @Get()
  @CheckPermissions([PermissionNameEnum.VIEW_FEATURE])
  findAll() { ... }

  @Post()
  @CheckPermissions([PermissionNameEnum.CREATE_FEATURE])
  create(@Body() dto: CreateFeatureDto) { ... }
}
```

### 5.6 Service Convention

```typescript
@Injectable()
export class FeatureService {
  private readonly logger = new Logger(FeatureService.name);

  constructor(private readonly repository: FeatureRepository) {}

  async create(dto: CreateFeatureDto): Promise<Feature> {
    // ✅ Dùng this.logger.debug/log/warn/error
    this.logger.debug("Creating feature", { dto });

    // ✅ Throw NestJS HTTP exceptions
    if (!data) throw new NotFoundException("Feature not found");

    // ✅ Emit events cho side effects (mail, notifications)
    this.eventEmitter.emit(FeatureEventEnum.CREATED, payload);
  }
}
```

### 5.7 App.module.ts Key Config

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], cache: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,      // ← BẮT BUỘC false
        ssl: { rejectUnauthorized: false },
      }),
    }),
    EventEmitterModule.forRoot({ wildcard: false }),
    // ... feature modules
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,     // ← Global JWT guard
    },
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
```

### 5.8 Authentication Flow (Hybrid)

```
1. Login (Email/Password):
   POST /auth/login → AuthService.loginInternal()
   → bcrypt.compare() với password trong DB
   → _generateTokens() → { accessToken (15min-1h), refreshToken (7d-30d) }
   → refreshToken lưu vào HttpOnly Cookie

2. Login (Azure SSO):
   Client → supabase.auth.signInWithOAuth({ provider: 'azure' })
   → Redirect về /auth/callback?access_token=...
   → POST /auth/azure-callback { token: supabaseToken }
   → AuthService.handleAzureCallback()
   → supabase.auth.getUser(token) để verify
   → _upsertProfile() → _generateTokens()

3. API Request:
   Authorization: Bearer <accessToken>
   → JwtStrategy.validate() → req.user (IJwtUser)

4. Token Refresh:
   POST /auth/refresh (cookie HttpOnly)
   → Verify refreshToken → issue new accessToken
```

### 5.9 Database Migrations

```bash
# KHÔNG ĐƯỢC dùng synchronize: true
# Mọi thay đổi schema → migration file

# Generate migration từ entity changes
DATABASE_URL=<url> npm run migration:generate apps/service/src/migrations/<timestamp>-description

# Run pending migrations
DATABASE_URL=<url> npm run migration:run

# Revert last migration
DATABASE_URL=<url> npm run migration:revert
```

Migration file format: `apps/service/src/migrations/YYYYMMDDHHMMSS-description.ts`

### 5.10 Event-Driven Side Effects

```typescript
// Emit từ Service
this.eventsService.emitLeaveEvent(LeaveEventEnum.LEAVE_APPROVED, payload);

// Listener nhận (trong listeners/)
@OnEvent(LeaveEventEnum.LEAVE_APPROVED)
async handleLeaveApproved(payload: LeaveApprovedEvent) {
  await this.mailService.sendLeaveApprovalEmail(payload);
}
```

---

## 6. Frontend (React + Vite) — `apps/client/`

### 6.1 Cấu trúc Thư mục

```
apps/client/src/
├── main.tsx                   # React root mount
├── App.tsx                    # Router setup (React Router v6) + PermissionProtectedRoute
├── index.css
├── components/                # Feature components (grouped by domain)
│   ├── layout/                # AppLayout, Sidebar, Header
│   ├── auth/                  # AuthCallback.tsx
│   ├── leave-request/         # LeaveRequestTable.tsx, LeaveRequestDialog.tsx
│   ├── late-early/            # LateEarlyTable.tsx, LateEarlyDialog.tsx
│   ├── table/                 # Shared generic table components
│   └── ...
├── pages/                     # Page-level components (1 file = 1 route)
│   ├── MyLeaveRequests.tsx
│   ├── TeamLeaveRequests.tsx
│   └── ...
├── services/                  # API service objects (plain objects, NOT class instances)
│   ├── api.service.ts         # axios apiClient + interceptors (token attach, refresh)
│   ├── leave-request.service.ts
│   ├── late-early-request.service.ts
│   └── ...
├── hooks/                     # Custom React hooks
│   ├── useHoliday.ts
│   ├── useLateEarlyRequest.ts
│   ├── useWorkCalendar.ts
│   └── ...
├── contexts/
│   └── AuthContext.tsx        # AuthProvider, useAuth()
├── lib/
│   ├── supabase.ts            # Supabase client (OAuth only)
│   └── token-store.ts         # In-memory access token store
├── consts/
│   └── routes.ts              # AppRoutes enum (ALL routes centralized here)
├── types/                     # FE-only types (không dùng chung với BE)
└── utils/                     # FE-only utility functions
```

### 6.2 Page Composition Pattern

Mỗi feature page theo cấu trúc:

```
Header (Title + Action Button)
  └── <FeatureTable />         # Table component với filter/search
        └── <FeatureDialog />  # Modal form (create/edit/view)
```

### 6.3 API Service Pattern

```typescript
// services/feature.service.ts — PLAIN OBJECT, không phải class
export const featureAPI = {
  getList: async (params: QueryFeatureDto) => {
    const { data } = await apiClient.get<IFeature[]>("/features", { params });
    return data;
  },

  create: async (dto: ICreateFeatureDto) => {
    const { data } = await apiClient.post<IFeature>("/features", dto);
    message.success("Created successfully");
    return data;
  },

  update: async (id: number, dto: IUpdateFeatureDto) => {
    const { data } = await apiClient.patch<IFeature>(`/features/${id}`, dto);
    message.success("Updated successfully");
    return data;
  },
};
```

### 6.4 Form Pattern (Ant Design)

```typescript
const [form] = Form.useForm<FormValues>();

// Submit
const onFinish = async (values: FormValues) => {
  try {
    const fields = await form.validateFields(); // Validate trước khi submit
    await featureAPI.create(fields);
    onOpenChange(false);
    form.resetFields(); // Reset khi đóng dialog
  } catch (err) {
    errorHandler(err, "Failed to save");
  }
};

// Reset khi close
const handleCancel = () => {
  onOpenChange(false);
  form.resetFields();
};
```

### 6.5 axios apiClient — Token & Refresh Logic

```typescript
// services/api.service.ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // ← Gửi kèm HttpOnly cookie (refreshToken)
});

// Request interceptor: tự động đính kèm Bearer token
apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: tự động refresh token khi 401
// → Có queue mechanism để không gọi refresh nhiều lần đồng thời
```

### 6.6 Routing — Permission Protected Route

```typescript
// App.tsx
<Route
  path={AppRoutes.MY_LEAVE_REQUESTS}
  element={
    <PermissionProtectedRoute permission={PermissionNameEnum.VIEW_OWN_LEAVE}>
      <MyLeaveRequestsPage />
    </PermissionProtectedRoute>
  }
/>
```

```typescript
// consts/routes.ts — TẤT CẢ routes tập trung tại đây
export const enum AppRoutes {
  HOME = "/",
  LOGIN = "/login",
  AUTH_CALLBACK = "/auth/callback",
  MY_LEAVE_REQUESTS = "/my-leave-requests",
  TEAM_LEAVE_REQUESTS = "/team-leave-requests",
  // ...
}
```

### 6.7 UI Rules

- **CHỈ dùng Ant Design v5** cho components (Button, Table, Form, Modal, Select, DatePicker, ...)
- **CHỈ dùng `styled-components` v5** khi cần dynamic layout styling (không phải logic-based styling)
- **KHÔNG import** UI libraries khác (Material UI, Chakra, Tailwind, ...)

---

## 7. RBAC — Role-Based Access Control

### 7.1 Kiến trúc

```
Profile ──< UserRole >── Role ──< RolePermission >── Permission
```

### 7.2 Luồng Check Permission (BE)

```typescript
// 1. Global JwtAuthGuard xác thực token → req.user (IJwtUser)
// 2. PermissionsGuard đọc @CheckPermissions() decorator
// 3. Query DB: SELECT permission từ user's roles

@Get('/team-requests')
@CheckPermissions([PermissionNameEnum.VIEW_TEAM_LEAVE])
getTeamRequests(@Request() req) { ... }
```

### 7.3 Seeding Permissions

```typescript
// apps/service/src/database/seeds/permission.seed.ts
// Chạy tự động khi app khởi động (trong main.ts)
await seedPermissions(dataSource); // Upsert tất cả permissions
await seedSuperAdmin(dataSource, email, password); // Tạo super admin từ env
```

---

## 8. Database Schema Conventions

### 8.1 Table Naming

- `snake_case` cho tất cả table và column names
- Entities dùng `@Column({ name: 'snake_case' })` để explicit mapping

### 8.2 Primary Keys

```typescript
// Integer identity PK (auto-increment)
@PrimaryGeneratedColumn('identity')
id: number;

// UUID PK (manually set từ external system như Supabase)
@PrimaryColumn({ type: 'uuid' })
id: string;
```

### 8.3 Soft Delete

Tất cả entity quan trọng dùng `@DeleteDateColumn()`:

```typescript
@DeleteDateColumn({ name: 'deleted_at' })
deletedAt?: Date;
```

Query luôn filter `deleted_at IS NULL`.

### 8.4 Audit Columns

```typescript
@CreateDateColumn({ name: 'created_at' })
createdAt: Date;

@UpdateDateColumn({ name: 'updated_at' })
updatedAt: Date;

@Column({ name: 'created_by', nullable: true })
createdBy?: string;

@Column({ name: 'updated_by', nullable: true })
updatedBy?: string;
```

---

## 9. Environment Variables

### Backend (apps/service)

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# JWT
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Supabase (for OAuth + Storage)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=...
SUPABASE_ANON_KEY=...

# App
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:4200
HR_SUPER_ADMIN_EMAIL=admin@company.com
HR_SUPER_ADMIN_PASSWORD=...

# Mail (Sendgrid)
SENDGRID_API_KEY=...
MAIL_FROM=no-reply@company.com

# DB Pool
DB_POOL_MAX=5
DB_POOL_MIN=0
DB_RETRY_ATTEMPTS=10
DB_RETRY_DELAY_MS=3000
```

### Frontend (apps/client)

```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_PUBLIC_BASE_URL=http://localhost:4200
```

---

## 10. Nx Workspace Commands

```bash
# Dev — chạy cả BE và FE song song
npm run dev
# OR
npx nx run-many --target=serve --projects=client,service --parallel

# Dev từng app
npm run dev:client      # → localhost:4200
npm run dev:service     # → localhost:3000

# Build
npm run build           # Build cả 2
npm run build:client
npm run build:service

# Database
npm run migration:generate apps/service/src/migrations/<name>
npm run migration:run
npm run migration:revert

# Seed
npm run seed:permission
```

---

## 11. main.ts Bootstrap Checklist

Khi setup project mới, `main.ts` phải có:

1. ✅ `cookieParser()` middleware
2. ✅ `enableCors({ credentials: true, origin: ... })`
3. ✅ `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`
4. ✅ Swagger setup với `addBearerAuth()` + `addCookieAuth('refreshToken', ...)`
5. ✅ `enableShutdownHooks()` cho graceful shutdown
6. ✅ Database seeding sau khi app listen

---

## 12. Strict Don'ts (TUYỆT ĐỐI KHÔNG)

1. ❌ Định nghĩa domain enum bên ngoài `libs/src/lib/enums/`
2. ❌ Import UI library nào khác ngoài Ant Design v5
3. ❌ `extends Repository<T>` trong custom repositories
4. ❌ `synchronize: true` trong TypeORM config
5. ❌ Chỉnh sửa migration file đã được apply
6. ❌ `console.log` trong backend — dùng NestJS `Logger`
7. ❌ Nhận `userId` từ request body/params — phải lấy từ `req.user` (JWT payload)
8. ❌ Định nghĩa interface/type trong `apps/` nếu nó cần dùng ở cả BE và FE

---

## 13. Khi Tạo Feature Mới — Checklist

### Backend

- [ ] Tạo Entity trong `apps/service/src/entities/<feature>/`
- [ ] Entity `implements` shared interface từ `@hr-systems/libs`
- [ ] Tạo migration: `npm run migration:generate`
- [ ] Đăng ký Entity trong `app.module.ts` (entities array)
- [ ] Tạo Module, Controller, Service, Repository trong `apps/service/src/<feature>/`
- [ ] Import Module vào `app.module.ts`
- [ ] Thêm `PermissionNameEnum.XXX_FEATURE` vào `libs/src/lib/enums/permission-enum.ts`
- [ ] Apply `@CheckPermissions([PermissionNameEnum.XXX])` trên endpoints

### Shared Library

- [ ] Thêm interface vào `libs/src/lib/types/<feature>.types.ts`
- [ ] Thêm enum vào `libs/src/lib/enums/<feature>.enum.ts`
- [ ] Re-export trong `libs/src/lib/libs.ts`

### Frontend

- [ ] Tạo `apps/client/src/services/<feature>.service.ts`
- [ ] Tạo `apps/client/src/hooks/use<Feature>.ts`
- [ ] Tạo `apps/client/src/components/<feature>/<Feature>Table.tsx`
- [ ] Tạo `apps/client/src/components/<feature>/<Feature>Dialog.tsx`
- [ ] Thêm route vào `apps/client/src/consts/routes.ts`
- [ ] Thêm route + `<PermissionProtectedRoute>` vào `App.tsx`

---

## 14. Ví dụ Codebase Patterns

### Shared Utility (libs)

```typescript
// libs/src/lib/utils/late-early.utils.ts
export const isPersonalLateEarlyRequest = (
  type?: LateEarlyTypeEnum,
  reasonCategory?: ReasonCategoryEnum,
): boolean =>
  (type === LateEarlyTypeEnum.EARLY || type === LateEarlyTypeEnum.LATE) &&
  reasonCategory === ReasonCategoryEnum.PERSONAL;
```

### Repository với excludeId pattern

```typescript
async countMonthlyPersonalRequests(
  requesterId: string,
  year: number,
  month: number,
  excludeId?: number  // ← Cho phép bỏ qua record hiện tại khi update
): Promise<number> {
  const qb = this.repo.createQueryBuilder('r')
    .where('r.requester_id = :requesterId', { requesterId })
    .andWhere('r.reason_category = :category', { category: ReasonCategoryEnum.PERSONAL })
    .andWhere('EXTRACT(YEAR FROM r.request_date) = :year', { year })
    .andWhere('EXTRACT(MONTH FROM r.request_date) = :month', { month })
    .andWhere('r.status NOT IN (:...statuses)', {
      statuses: [StatusEnum.REJECTED, StatusEnum.DRAFT, StatusEnum.CANCELLED]
    })
    .andWhere('r.deleted_at IS NULL');

  if (excludeId) {
    qb.andWhere('r.id != :excludeId', { excludeId });
  }

  return qb.getCount();
}
```

### Event-Driven Mail

```typescript
// Service emit event
this.eventsService.emit(FeatureEventEnum.SUBMITTED, {
  requestId: result.id,
  ...emailPayload
});

// Listener (listeners/<feature>-mail.listener.ts)
@OnEvent(FeatureEventEnum.SUBMITTED)
async handleSubmitted(payload: FeatureSubmittedEvent) {
  await this.mailService.sendSubmittedEmail(payload);
}
```
