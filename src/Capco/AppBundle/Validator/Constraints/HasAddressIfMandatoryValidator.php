<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Helper\GeometryHelper;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasAddressIfMandatoryValidator extends ConstraintValidator
{
    public function validate($object, Constraint $constraint)
    {
        $form = $object->getProposalForm();

        if (!$form->getUsingAddress()) {
            return;
        }

        $address = $object->getAddress();
        if (!$address) {
            $this->context->buildViolation($constraint->noAddressMessage)->addViolation();

            return;
        }

        // TODO Security: here we should do something validate the structure, recheck with google map api...
        $decodedAddress = json_decode($address, true);
        if (!$decodedAddress) {
            $this->context->buildViolation($constraint->noValidJsonAddressMessage)->addViolation();

            return;
        }

        $this->checkAddressInZone($decodedAddress, $form, $constraint);
    }

    private function checkAddressInZone(
        array $decodedAddress,
        ProposalForm $form,
        HasAddressIfMandatory $constraint
    ): void {
        if ($form->isUsingDistrict() && $form->isProposalInAZoneRequired()) {
            $latitude = $decodedAddress[0]['geometry']['location']['lat'];
            $longitude = $decodedAddress[0]['geometry']['location']['lng'];
            if (!self::isInAnyDistrict($latitude, $longitude, $form)) {
                $this->context
                    ->buildViolation($constraint->addressNotInZoneMessage)
                    ->addViolation();
            }
        }
    }

    private static function isInAnyDistrict(
        float $latitude,
        float $longitude,
        ProposalForm $form
    ): bool {
        foreach ($form->getDistricts() as $district) {
            if (self::isInDistrict($latitude, $longitude, $district)) {
                return true;
            }
        }

        return false;
    }

    private static function isInDistrict(
        float $latitude,
        float $longitude,
        ProposalDistrict $district
    ): bool {
        return $district->getGeojson() &&
            GeometryHelper::isIncluded($longitude, $latitude, $district->getGeojson());
    }
}
