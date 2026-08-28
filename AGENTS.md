# AGENTS.md — HR Systems Rules & Conventions

## 1. Stack & Shared Library Architecture
- **Tech Stack**: Monorepo (Nx 21) | NestJS 11 (`apps/service`) | React 19 + Vite 7 (`apps/client`) | PostgreSQL + TypeORM 0.3.x
- **Shared Lib**: `@hr-systems/libs` (`libs/src/lib/{enums,types,utils,consts}`). **MUST** re-export all files in `libs/src/lib/libs.ts`.
- **UI Library**: **Ant Design (antd) v5 ONLY**. Do not import other UI libraries. Use `styled-components` v5 only for dynamic layout styling.

## 2. Naming Conventions & Enum Rules
- **File Naming**: `kebab-case` (`leave-request.service.ts`, `LeaveRequestDialog.tsx`, `useHoliday.ts`).
- **Interfaces & Types**: Interface `IProfile` (`I` prefix), DTO `ICreateXxxDto`, Enum `XxxStatusEnum` (ends with `Enum`).
- **Enum Members**: `UPPER_SNAKE_CASE` keys with `'lower_snake_case'` string values (`ACTIVE = 'active'`).
- **CRITICAL ENUM RULE**: **ALL** domain enums MUST live in `libs/src/lib/enums/` and be re-exported in `libs.ts`. Never define domain enums locally in `apps/client` or `apps/service`.

## 3. Backend Conventions (NestJS)
- **Module Structure**: `apps/service/src/<feature>/` containing `<feature>.{module,controller,service}.ts`, `repository/`, and `dto/`.
- **Entities**: Located in `apps/service/src/entities/<feature>/`. Class MUST `implements` shared interface from `@hr-systems/libs`. PK: `@PrimaryGeneratedColumn('identity')` (int) or `@PrimaryColumn({ type: 'uuid' })`. Column names mapped explicitly (`@Column({ name: 'snake_case' })`). Register in `app.module.ts`.
- **Repository Pattern**: `@Injectable()` custom repository classes injecting TypeORM repository (`@InjectRepository(Entity)`). Do NOT extend `Repository<T>`.
- **Controllers & Auth**: `@UseGuards(JwtAuthGuard, PermissionsGuard)`. Apply `@CheckPermissions([PermissionNameEnum.XXX])` on endpoints.
- **Services**: Use NestJS `Logger` (no `console.log`). Throw standard NestJS HTTP exceptions. Emit events via `EventEmitterModule` for side effects.

## 4. Frontend Conventions (React)
- **Structure**: `apps/client/src/` -> `components/<feature>/`, `pages/`, `services/`, `hooks/`, `consts/routes.ts`.
- **Page Composition**: Header (Title + Action Button) + Table (`<XxxTable>`) + Dialog (`<XxxDialog>`).
- **Form Pattern**: Use `Form.useForm()`, declarative rules on `<Form.Item>`, submit via `await form.validateFields()`, reset on close.
- **API Services**: Plain objects in `src/services/<feature>.service.ts` using `apiClient`. Display antd `message.success()` / `message.error()`.
- **Routing**: Centralized in `AppRoutes` enum (`src/consts/routes.ts`). Wrap protected routes with `<PermissionProtectedRoute>`.

## 5. Database & Migrations
- `synchronize: false` is strictly enforced. Schema changes require TypeORM migrations in `apps/service/src/migrations/YYYYMMDDHHMMSS-description.ts`.
- Commands: `DATABASE_URL=<url> npm run migration:run` | `migration:generate` | `migration:revert`.

## 6. Strict Don'ts
1. ❌ Never define domain enums outside `libs/src/lib/enums/`.
2. ❌ Never import UI frameworks other than Ant Design.
3. ❌ Never extend TypeORM `Repository<T>` directly in custom repositories.
4. ❌ Never use `synchronize: true` or modify applied migrations.
5. ❌ Never use `console.log` in backend — use NestJS `Logger`.
