import {Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards} from "@nestjs/common";
import {PackUsecase} from "../../aplication/usecases/pack/pack.usecase";
import {AddPackDto} from "../../domain/pack/pack/dto/add-pack.dto";
import {JwtGuard} from "../../infrastructure/common/guards/jwt.guard";
import {CustomHttpException} from "../../infrastructure/common/exceptions/custom-http.exception";
import {ApplyPackDto} from "./dto/apply-pack.dto";
import {CheckApplyDto} from "./dto/check-apply.dto";

@Controller('pack')
export class PackController {
    constructor(private readonly packUsecase: PackUsecase) {}

    @Post('create')
    @HttpCode(200)
    async create(@Body() body: AddPackDto): Promise<any> {
        try {
            return await this.packUsecase.create(body);
        } catch (e) {
            throw new CustomHttpException({
                message: e.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    @Get()
    @HttpCode(201)
    async getAll(): Promise<any> {
        try {
            return await this.packUsecase.getAll();
        } catch (e) {
            throw new CustomHttpException({
                message: e.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    @UseGuards(JwtGuard)
    @Post('apply')
    @HttpCode(200)
    async apply(@Body() body: ApplyPackDto){
        try {
            return await this.packUsecase.apply(body);
        } catch (e) {
            throw new CustomHttpException({
                message: e.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    @UseGuards(JwtGuard)
    @Post('checkApply')
    @HttpCode(200)
    async chApply(@Body() body: CheckApplyDto, @Request() req: any){
        try {
            const { user } = req;

            return await this.packUsecase.checkApply(body, user);

        } catch (e) {
            throw new CustomHttpException({
                message: e.message,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }
}