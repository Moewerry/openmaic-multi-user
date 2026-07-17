-- P1 authentication: server-side sessions and credential uniqueness.
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student';

DROP INDEX IF EXISTS "user_credentials_username_idx";
DROP INDEX IF EXISTS "user_credentials_external_id_idx";

CREATE UNIQUE INDEX "user_credentials_auth_type_username_key"
ON "user_credentials"("auth_type", "username");

CREATE UNIQUE INDEX "user_credentials_auth_type_external_id_key"
ON "user_credentials"("auth_type", "external_id");

CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3),

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_sessions_token_hash_key" ON "auth_sessions"("token_hash");
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions"("user_id");
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions"("expires_at");

ALTER TABLE "auth_sessions"
ADD CONSTRAINT "auth_sessions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
