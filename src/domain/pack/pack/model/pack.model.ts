import {AddPackDto} from "../dto/add-pack.dto";
import {PackEntity} from "../../../../infrastructure/pack/pack/entity/pack.entity";

export class Pack {
    id?: number;
    name: string;
    description?: string;
    sumMoney: number;
    sumPoint: number;

    private constructor(
        name: string,
        sumMoney: number,
        sumPoint: number,
        {
            id,
            description,
        }: {
            id?: number;
            description?: string;
        },
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.sumMoney = sumMoney;
        this.sumPoint = sumPoint;
    }

    public static create(data: AddPackDto): Pack {
        const { name, description, sumMoney, sumPoint } = data;
        return new Pack(
            name, sumMoney, sumPoint, {description},
        );
    }

    public static fromEntity(entity: PackEntity): Pack {
        const {
            id,
            name,
            description,
            sumMoney,
            sumPoint
        } = entity;

        return new Pack(
            name,
            sumMoney,
            sumPoint,
            {id, description},
        );
    }
}