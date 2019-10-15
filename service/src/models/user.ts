import { User as FUser } from "@furystack/core";
import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class User implements FUser {
  @PrimaryColumn({ unique: true, nullable: false })
  public username!: string;

  @Column({ nullable: false })
  public password!: string;

  @Column({ type: "simple-json" })
  roles: string[] = [];
}
