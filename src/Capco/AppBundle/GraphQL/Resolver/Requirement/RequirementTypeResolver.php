<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class RequirementTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver)
    {
    }

    public function __invoke(Requirement $requirement): Type
    {
        if (Requirement::CHECKBOX === $requirement->getType()) {
            return $this->typeResolver->resolve('CheckboxRequirement');
        }
        if (Requirement::FIRSTNAME === $requirement->getType()) {
            return $this->typeResolver->resolve('FirstnameRequirement');
        }
        if (Requirement::LASTNAME === $requirement->getType()) {
            return $this->typeResolver->resolve('LastnameRequirement');
        }
        if (Requirement::PHONE === $requirement->getType()) {
            return $this->typeResolver->resolve('PhoneRequirement');
        }
        if (Requirement::DATE_OF_BIRTH === $requirement->getType()) {
            return $this->typeResolver->resolve('DateOfBirthRequirement');
        }
        if (Requirement::POSTAL_ADDRESS === $requirement->getType()) {
            return $this->typeResolver->resolve('PostalAddressRequirement');
        }
        if (Requirement::IDENTIFICATION_CODE === $requirement->getType()) {
            return $this->typeResolver->resolve('IdentificationCodeRequirement');
        }
        if (Requirement::PHONE_VERIFIED === $requirement->getType()) {
            return $this->typeResolver->resolve('PhoneVerifiedRequirement');
        }
        if (Requirement::FRANCE_CONNECT === $requirement->getType()) {
            return $this->typeResolver->resolve('FranceConnectRequirement');
        }
        if (Requirement::EMAIL_VERIFIED === $requirement->getType()) {
            return $this->typeResolver->resolve('EmailVerifiedRequirement');
        }
        if (Requirement::ZIP_CODE === $requirement->getType()) {
            return $this->typeResolver->resolve('ZipCodeRequirement');
        }
        if (Requirement::CONSENT_PRIVACY_POLICY === $requirement->getType()) {
            return $this->typeResolver->resolve('ConsentPrivacyPolicyRequirement');
        }
        if (Requirement::SSO === $requirement->getType()) {
            return $this->typeResolver->resolve('SSORequirement');
        }

        throw new UserError('Could not resolve type of Requirement.');
    }
}
