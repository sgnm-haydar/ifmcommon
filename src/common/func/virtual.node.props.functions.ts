import { SpaceType } from '../const/space.type.enum';

export function avaiableUpdateVirtualPropsGetter(
  dto,
  virtualProps: string[],
  kafkaObjectArray,
) {
  const existVİrtualNodePropsInDtoArray = Object.keys(dto).filter((key) => {
    if (virtualProps.includes(key)) {
      return key;
    }
  });

  const finalObject = [];
  for (let i = 0; i < kafkaObjectArray.length; i++) {
    const arr = Object.keys(kafkaObjectArray[i])
      .map((prop) => {
        if (existVİrtualNodePropsInDtoArray.includes(prop)) {
          if (prop === 'space') {
            switch (dto.spaceType) {
              case SpaceType.SPACE:
                kafkaObjectArray[i]['url'] = 'STRUCTURE_URL';

                break;
              case SpaceType.JOINTSPACE:
                kafkaObjectArray[i]['url'] = 'JOINTSPACE_URL';

                break;

              default:
                break;
            }
          }
          kafkaObjectArray[i]['newParentKey'] = dto[prop];
          delete kafkaObjectArray[i][prop];
          return kafkaObjectArray[i];
        }
      })
      .filter((valid) => {
        if (valid !== undefined) {
          return valid;
        }
      });
    if (arr.length > 0) {
      finalObject.push(arr[0]);
    }
  }

  return finalObject;
}

export function avaiableCreateVirtualPropsGetter(
  dto,
  virtualProps: string[],
  kafkaObjectArray,
) {
  const existVİrtualNodePropsInDtoArray = Object.keys(dto).filter((key) => {
    if (virtualProps.includes(key)) {
      return key;
    }
  });

  const finalObject = [];
  for (let i = 0; i < kafkaObjectArray.length; i++) {
    const arr = Object.keys(kafkaObjectArray[i])
      .map((prop) => {
        if (existVİrtualNodePropsInDtoArray.includes(prop)) {
          if (prop === 'space') {
            switch (dto.spaceType) {
              case SpaceType.SPACE:
                kafkaObjectArray[i]['url'] = 'STRUCTURE_URL';

                break;
              case SpaceType.JOINTSPACE:
                kafkaObjectArray[i]['url'] = 'JOINTSPACE_URL';

                break;

              default:
                break;
            }
          }
          kafkaObjectArray[i]['referenceKey'] = dto[prop];
          delete kafkaObjectArray[i][prop];
          return kafkaObjectArray[i];
        }
      })
      .filter((valid) => {
        if (valid !== undefined) {
          return valid;
        }
      });
    if (arr.length > 0) {
      finalObject.push(arr[0]);
    }
  }

  return finalObject;
}
