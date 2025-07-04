import { Message } from './types/message-types.js';
import { ValidationResult } from '../validation/types.js';

export class MessageValidator {
  validateMessage(message: Message): ValidationResult {
    const errors: string[] = [];

    if (!message.type) {
      errors.push('Message type is required');
    }

    if (!['register', 'task', 'response', 'error'].includes(message.type)) {
      errors.push('Invalid message type');
    }

    if (message.type === 'task') {
      if (!message.task_id) errors.push('Task ID is required');
      if (!message.query) errors.push('Query is required');
    }

    if (message.type === 'response') {
      if (!message.task_id) errors.push('Task ID is required');
      if (!message.subsystem) errors.push('Subsystem is required');
      if (message.result === undefined) errors.push('Result is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}