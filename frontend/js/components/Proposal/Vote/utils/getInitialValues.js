// @flow

import moment from 'moment';
import formatPhoneNumber from '~/utils/formatPhoneNumber';

const getInitialValues = (
  requirements: any,
  isPhoneVerificationOnly: boolean,
  needToVerifyPhone: boolean,
  user: any,
) => {
  return isPhoneVerificationOnly
    ? {
        PhoneVerifiedRequirement: {
          CountryCode: '+33',
          phoneNumber: user?.phone ? formatPhoneNumber(user.phone) : null,
        },
      }
    : requirements.length && requirements.length > 0
    ? requirements?.reduce((acc: Object, requirement) => {
        if (requirement.__typename === 'PostalAddressRequirement') {
          return {
            ...acc,
            [requirement.__typename]: requirement.viewerAddress
              ? requirement.viewerAddress.formatted
              : null,
          };
        }
        if (requirement.__typename === 'DateOfBirthRequirement') {
          return {
            ...acc,
            [requirement.__typename]: requirement.viewerDateOfBirth
              ? moment(requirement.viewerDateOfBirth)
              : null,
          };
        }

        if (requirement.__typename === 'IdentificationCodeRequirement') {
          return {
            ...acc,
            IdentificationCodeRequirement: requirement.viewerValue ? requirement.viewerValue : '',
          };
        }

        if (requirement.__typename === 'PhoneRequirement') {
          if (!needToVerifyPhone) {
            return {
              ...acc,
              PhoneRequirement: {
                CountryCode: '+33',
                phoneNumber: user?.phone ? formatPhoneNumber(user.phone) : null,
              },
            };
          }
          return {
            ...acc,
            PhoneVerifiedRequirement: {
              CountryCode: '+33',
              phoneNumber: user?.phone ? formatPhoneNumber(user.phone) : null,
            },
          };
        }

        if (requirement.__typename === 'CheckboxRequirement') {
          return {
            ...acc,
            [requirement.__typename]: [
              ...(acc[requirement.__typename] || []),
              {
                viewerMeetsTheRequirement: requirement.viewerMeetsTheRequirement,
                label: requirement.label,
                id: requirement.id,
              },
            ],
          };
        }

        if (requirement.__typename === 'PhoneVerifiedRequirement') {
          return acc;
        }

        return {
          ...acc,
          [requirement.__typename]: requirement.viewerValue,
        };
      }, {})
    : {};
};
export default getInitialValues;
