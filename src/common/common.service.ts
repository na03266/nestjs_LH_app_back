import { Injectable } from '@nestjs/common';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';
import { envVariables } from './const/env.const';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonService {
	constructor(private readonly configService: ConfigService) {}

	applyPagePaginationParamToQb<T extends ObjectLiteral>(
		qb: SelectQueryBuilder<T>,
		dto: PagePaginationDto,
	) {
		const { page, take } = dto;
		const skip = (page - 1) * take;
		qb.take(take);
		qb.skip(skip);
	}

	async generateWithOllama(prompt: string, system?: string, options?: string) {
		const baseUrl = this.configService.get<string>(envVariables.ollamaBaseUrl);
		const model = this.configService.get<string>(envVariables.ollamaModel);

		const payload: Record<string, any> = {
			model,
			prompt: prompt,
			stream: false,
		};
		if (system) payload.system = system;
		if (options) payload.options = options;

		const res = await fetch(`${baseUrl}/api/generate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(
				`Ollama request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`,
			);
		}

		const data = await res.json()
		return data.response;
	}
}
