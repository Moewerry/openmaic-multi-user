-- Free registration requires each supplied email address to be unique.
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
