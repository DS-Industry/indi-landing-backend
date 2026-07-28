import {AddPackDto} from "../dto/add-pack.dto";
import {PackEntity} from "../../../../infrastructure/pack/pack/entity/pack.entity";

export class Pack {
    id?: number;
    name: string;
    description?: string;
    sumMoney: number;
    sumPoint: number;
    isBurnable: boolean;
    isVisible: boolean;
    lifetimeDays?: number;

    private constructor(
        name: string,
        sumMoney: number,
        sumPoint: number,
        {
            id,
            description,
            isBurnable,
            isVisible,
            lifetimeDays,
        }: {
            id?: number;
            description?: string;
            isBurnable?: boolean;
            isVisible?: boolean;
            lifetimeDays?: number;
        },
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.sumMoney = sumMoney;
        this.sumPoint = sumPoint;
        this.isBurnable = isBurnable ?? false;
        this.isVisible = isVisible ?? false;
        this.lifetimeDays = lifetimeDays;
    }

    public static create(data: AddPackDto): Pack {
        const { name, description, sumMoney, sumPoint, isBurnable, isVisible, lifetimeDays } = data;
        return new Pack(
            name, sumMoney, sumPoint, {description, isBurnable, isVisible, lifetimeDays},
        );
    }

    public static fromEntity(entity: PackEntity): Pack {
        const {
            id,
            name,
            description,
            sumMoney,
            sumPoint,
            isBurnable,
            isVisible,
            lifetimeDays,
        } = entity;

        return new Pack(
            name,
            sumMoney,
            sumPoint,
            {id, description, isBurnable, isVisible, lifetimeDays},
        );
    }
}
