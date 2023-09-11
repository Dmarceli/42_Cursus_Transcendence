import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';

@Injectable()
export class ParseIdPipe extends ParseIntPipe implements PipeTransform<number> {
	async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
		const id = await super.transform(value, metadata);

		// You can adjust these min and max values as needed
		const min = 1;
		const max = 1000;

		if (id < min || id > max) {
			throw new BadRequestException(`ID must be between ${min} and ${max}`);
		}

		return id;
	}
}