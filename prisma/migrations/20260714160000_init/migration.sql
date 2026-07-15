-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'teacher', 'student');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "school_user_id" VARCHAR(128) NOT NULL,
    "username" VARCHAR(128),
    "name" VARCHAR(128),
    "email" VARCHAR(255),
    "role" "UserRole" NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_credentials" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "auth_type" VARCHAR(32) NOT NULL,
    "username" VARCHAR(128),
    "password_hash" VARCHAR(255),
    "external_id" VARCHAR(128),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_quotas" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "quota_month_tokens" BIGINT NOT NULL,
    "used_month_tokens" BIGINT NOT NULL DEFAULT 0,
    "quota_day_tokens" BIGINT NOT NULL,
    "used_day_tokens" BIGINT NOT NULL DEFAULT 0,
    "reset_month_at" TIMESTAMP(3) NOT NULL,
    "reset_day_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_logs" (
    "id" UUID NOT NULL,
    "request_id" VARCHAR(128) NOT NULL,
    "user_id" UUID NOT NULL,
    "role" VARCHAR(32),
    "model" VARCHAR(128),
    "action_type" VARCHAR(64),
    "prompt_tokens" BIGINT NOT NULL DEFAULT 0,
    "completion_tokens" BIGINT NOT NULL DEFAULT 0,
    "total_tokens" BIGINT NOT NULL DEFAULT 0,
    "status" VARCHAR(32),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classrooms" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "teacher_id" UUID NOT NULL,
    "share_enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(32) NOT NULL DEFAULT 'open',
    "content_version" INTEGER NOT NULL DEFAULT 0,
    "content_updated_at" TIMESTAMP(3),
    "content_uri" VARCHAR(512),
    "token_budget" BIGINT,
    "tokens_used" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom_participants" (
    "id" UUID NOT NULL,
    "classroom_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classroom_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models" (
    "id" UUID NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "provider" VARCHAR(128) NOT NULL,
    "model_id" VARCHAR(128) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "allowed_roles" TEXT[] NOT NULL,
    "max_tokens_per_request" BIGINT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" VARCHAR(128) NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "login_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "school_user_id" VARCHAR(128),
    "ip" VARCHAR(64),
    "user_agent" TEXT,
    "status" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" UUID NOT NULL,
    "admin_user_id" UUID NOT NULL,
    "action" VARCHAR(64) NOT NULL,
    "target_type" VARCHAR(32),
    "target_id" VARCHAR(128),
    "detail" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_school_user_id_key" ON "users"("school_user_id");

-- CreateIndex
CREATE INDEX "user_credentials_username_idx" ON "user_credentials"("username");

-- CreateIndex
CREATE INDEX "user_credentials_external_id_idx" ON "user_credentials"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_quotas_user_id_key" ON "user_quotas"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "usage_logs_request_id_key" ON "usage_logs"("request_id");

-- CreateIndex
CREATE INDEX "idx_usage_logs_user_created" ON "usage_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_usage_logs_created" ON "usage_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_classrooms_teacher" ON "classrooms"("teacher_id");

-- CreateIndex
CREATE INDEX "idx_participants_user" ON "classroom_participants"("user_id");

-- CreateIndex
CREATE INDEX "idx_participants_classroom" ON "classroom_participants"("classroom_id");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_participants_classroom_id_user_id_key" ON "classroom_participants"("classroom_id", "user_id");

-- AddForeignKey
ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quotas" ADD CONSTRAINT "user_quotas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_participants" ADD CONSTRAINT "classroom_participants_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_participants" ADD CONSTRAINT "classroom_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_logs" ADD CONSTRAINT "login_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
