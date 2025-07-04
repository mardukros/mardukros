import { MemoryInterface } from '../memory-interface.js';
import { MemoryItem, MemoryQuery } from '../types/base-types.js';
import { MemoryValidation } from '../types/memory-interface.js';
import { MemoryValidator } from '../utils/memory-validation.js';
import { logger } from '../../utils/logger.js';

export abstract class BaseMemorySubsystem<T extends MemoryItem = MemoryItem> extends MemoryInterface<T> {
  protected validator: MemoryValidator;

  constructor(capacity: number) {
    super(capacity);
    this.validator = new MemoryValidator();
  }

  protected async validateItem(item: T): Promise<void> {
    const validation = await this.performValidation(item);
    if (!validation.valid) {
      throw new Error(`Invalid item: ${validation.errors.join(', ')}`);
    }
  }

  protected async afterStore(item: T): Promise<void> {
    logger.info('Item stored', { 
      type: item.type,
      id: item.id 
    });
  }

  protected async afterUpdate(item: T): Promise<void> {
    logger.info('Item updated', { 
      type: item.type,
      id: item.id 
    });
  }

  protected async afterDelete(item: T): Promise<void> {
    logger.info('Item deleted', { 
      type: item.type,
      id: item.id 
    });
  }

  protected abstract performValidation(item: T): Promise<MemoryValidation>;
}