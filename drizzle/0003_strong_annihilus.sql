CREATE TABLE "friluftskompis_trip_group_user" (
	"groupId" integer NOT NULL,
	"userId" varchar(256) NOT NULL,
	CONSTRAINT "friluftskompis_trip_group_user_groupId_userId_pk" PRIMARY KEY("groupId","userId")
);
--> statement-breakpoint
ALTER TABLE "friluftskompis_trip_group_user" ADD CONSTRAINT "friluftskompis_trip_group_user_groupId_friluftskompis_trip_group_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."friluftskompis_trip_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trip_group_user_user_idx" ON "friluftskompis_trip_group_user" USING btree ("userId");