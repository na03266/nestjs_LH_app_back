import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import {Exclude} from "class-transformer";

@Entity({ name: 'department' })
@Check('ck_department_depth', 'depth BETWEEN 1 AND 3')
@Unique('uq_department_parent_name', ['parent', 'name'])
export class Department {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    name!: string;

    @Index('idx_department_parent')
    @ManyToOne(() => Department, (dept) => dept.children, {
        nullable: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // 필요시 RESTRICT/CASCADE 검토
    })
    @JoinColumn({
        name: 'parent_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'fk_department_parent',
    })
    parent?: Department | null;

    @OneToMany(() => Department, (dept) => dept.parent)
    children!: Department[];

    @Column({ type: 'tinyint', unsigned: true })
    depth!: number;

    @Exclude()
    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
        precision: 6, // 팀 기준으로 0 또는 6으로 고정
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    createdAt!: Date;

    @Exclude()
    @UpdateDateColumn({
        name: 'updated_at',
        type: 'datetime',
        precision: 6, // 팀 기준으로 0 또는 6으로 고정
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
    })
    updatedAt!: Date;
}
