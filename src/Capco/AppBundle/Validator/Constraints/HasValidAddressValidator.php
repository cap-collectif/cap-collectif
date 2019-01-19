<?php

namespace Capco\AppBundle\Validator\Constraints;

use Geocoder\Exception\NoResult;
use Geocoder\Provider\GoogleMaps;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasValidAddressValidator extends ConstraintValidator
{
    private $geocoder;
    private $logger;

    public function __construct(GoogleMaps $geocoder, LoggerInterface $logger)
    {
        $this->geocoder = $geocoder;
        $this->logger = $logger;
    }

    public function validate($object, Constraint $constraint): bool
    {
        if (!$object->getAddress() || !$object->getCity()) {
            $object->setLat(null);
            $object->setLng(null);

            return true;
        }
        $address = $object->getAddress() . ', ' . $object->getZipCode() . ' ' . $object->getCity() . ', ' . $object->getCountry();

        try {
            $coordinates = $this->geocoder->geocode($address)->first()->getCoordinates();
        } catch (NoResult $e) {
            $this->logger->error($e->getMessage());
            $coordinates = false;
        }

        if (false !== $coordinates) {
            $object->setLat($coordinates->getLatitude());
            $object->setLng($coordinates->getLongitude());
        } else {
            $this->context
                    ->buildViolation($constraint->message)
                    ->atPath('address')
                    ->addViolation()
                ;
            $this->context->buildViolation('')
                    ->atPath('zipCode')
                    ->addViolation()
                ;
            $this->context->buildViolation('')
                    ->atPath('city')
                    ->addViolation()
                ;
            $this->context->buildViolation('')
                    ->atPath('country')
                    ->addViolation()
                ;

            return false;
        }

        return true;
    }
}
