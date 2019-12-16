<?php

namespace Capco\AppBundle\Validator\Constraints;

use Geocoder\Provider\GoogleMaps\GoogleMaps;
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
        if (empty($object->getCity())) {
            $object->setLat(null);
            $object->setLng(null);

            return true;
        }

        $address = !empty($object->getAddress()) ? $object->getAddress() . ', ' : '';
        $address .= !empty($object->getZipCode()) ? $object->getZipCode() . ' ' : '';
        $address .= !empty($object->getCity()) ? $object->getCity() . ', ' : '';
        $address .= !empty($object->getCountry()) ? $object->getCountry() : '';

        $address = rtrim($address, ', ');
        $address = trim($address);

        try {
            $coordinates = $this->geocoder
                ->geocode($address)
                ->first()
                ->getCoordinates();
        } catch (\Exception $e) {
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
                ->addViolation();
            $this->context
                ->buildViolation('')
                ->atPath('zipCode')
                ->addViolation();
            $this->context
                ->buildViolation('')
                ->atPath('city')
                ->addViolation();
            $this->context
                ->buildViolation('')
                ->atPath('country')
                ->addViolation();

            $object->setLat(null);
            $object->setLng(null);

            return false;
        }

        return true;
    }
}
