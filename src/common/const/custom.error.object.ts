import { CommonMicroserviceError } from './custom.error.enum';

export function has_children_error(params) {
  return {
    message: 'This node has children, you can not delete it..',
    code: CommonMicroserviceError.HAS_CHILDREN,
    params: params,
  };
}

export function wrong_parent_error() {
  return {
    message: 'This node cannot be added below the specified node',
    code: CommonMicroserviceError.WRONG_PARENT,
  };
}

export function node_not_found() {
  return {
    message: 'Node not found',
    code: CommonMicroserviceError.NODE_NOT_FOUND,
  };
}

export function invalid_classification() {
  return {
    message: 'some of classification ur entered is wrong',
    code: CommonMicroserviceError.INVALID_CLASSIFICATION,
  };
}

export function other_microservice_errors(message) {
  return {
    message,
    code: CommonMicroserviceError.OTHER_MICROSERVICE_ERROR,
  };
}
