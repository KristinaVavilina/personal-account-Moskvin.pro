using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "status",
                table: "users");

            migrationBuilder.RenameColumn(
                name: "key",
                table: "system_settings",
                newName: "id");

            migrationBuilder.AddColumn<bool>(
                name: "is_archived",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "time_logs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "ix_time_logs_user_id",
                table: "time_logs",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_time_logs_users_user_id",
                table: "time_logs",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_time_logs_users_user_id",
                table: "time_logs");

            migrationBuilder.DropIndex(
                name: "ix_time_logs_user_id",
                table: "time_logs");

            migrationBuilder.DropColumn(
                name: "is_archived",
                table: "users");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "time_logs");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "system_settings",
                newName: "key");

            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
