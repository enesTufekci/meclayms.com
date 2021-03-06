# Migration `20200927150057`

This migration has been generated by Enes Tüfekçi at 9/27/2020, 5:00:57 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."EntryCredit" ADD COLUMN "entryId" text   

ALTER TABLE "public"."EntryDiscredit" ADD COLUMN "entryId" text   

ALTER TABLE "public"."User" ADD COLUMN "suspendedUntil" timestamp(3)   

ALTER TABLE "public"."EntryCredit" ADD FOREIGN KEY ("entryId")REFERENCES "public"."Entry"("id") ON DELETE SET NULL ON UPDATE CASCADE

ALTER TABLE "public"."EntryDiscredit" ADD FOREIGN KEY ("entryId")REFERENCES "public"."Entry"("id") ON DELETE SET NULL ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200927144334..20200927150057
--- datamodel.dml
+++ datamodel.dml
@@ -2,9 +2,9 @@
 // learn more about it in the docs: https://pris.ly/d/prisma-schema
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 generator client {
   provider = "prisma-client-js"
@@ -30,8 +30,9 @@
   password               String
   role                   UserRole         @default(USER)
   status                 UserStatus       @default(ACTIVE)
   confirmed              Boolean          @default(false)
+  suspendedUntil         DateTime?
   createdAt              DateTime         @default(now())
   updatedAt              DateTime         @default(now())
   refreshTokenIssueCount Int              @default(0)
   Entry                  Entry[]
@@ -66,18 +67,20 @@
   deletedAt    DateTime?
 }
 model Entry {
-  id           String          @id @default(uuid())
+  id           String           @id @default(uuid())
   body         String
-  createdBy    User            @relation(fields: [userId], references: [id])
-  Topic        Topic?          @relation(fields: [topicId], references: [id])
+  createdBy    User             @relation(fields: [userId], references: [id])
+  Topic        Topic?           @relation(fields: [topicId], references: [id])
   topicId      String?
   userId       String
   revisions    EntryRevision[]
+  credits      EntryCredit[]
+  discredits   EntryDiscredit[]
   deleteReason String?
-  createdAt    DateTime        @default(now())
-  updatedAt    DateTime        @default(now())
+  createdAt    DateTime         @default(now())
+  updatedAt    DateTime         @default(now())
   deletedAt    DateTime?
   Feedback     Feedback[]
 }
@@ -91,17 +94,21 @@
   deletedAt DateTime?
 }
 model EntryCredit {
-  id      String @id @default(uuid())
-  givenBy User   @relation(fields: [userId], references: [id])
+  id      String  @id @default(uuid())
+  givenBy User    @relation(fields: [userId], references: [id])
   userId  String
+  Entry   Entry?  @relation(fields: [entryId], references: [id])
+  entryId String?
 }
 model EntryDiscredit {
-  id      String @id @default(uuid())
-  givenBy User   @relation(fields: [userId], references: [id])
+  id      String  @id @default(uuid())
+  givenBy User    @relation(fields: [userId], references: [id])
   userId  String
+  Entry   Entry?  @relation(fields: [entryId], references: [id])
+  entryId String?
 }
 model Feedback {
   id        String   @id @default(uuid())
```


