<?php

namespace Capco\AppBundle\Validator\Constraints;

use Geocoder\Provider\GoogleMaps;
use Ivory\HttpAdapter\CurlHttpAdapter;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class HasValidAddressValidator extends ConstraintValidator
{
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function validate($object, Constraint $constraint): bool
    {
        if (!$object->getAddress() || !$object->getCity()) {
            $object->setLat(null);
            $object->setLng(null);
        }

        $apiKey = $this->container->getParameter('google_maps_key_server');
        $curl = new CurlHttpAdapter();
        $geocoder = new GoogleMaps($curl, null, null, true, $apiKey);

        $address = $object->getAddress() . ', ' . $object->getZipCode() . ' ' . $object->getCity() . ', ' . $object->getCountry();
        try {
            $coordinates = $geocoder->geocode($address)->first()->getCoordinates();
        } catch (\RuntimeException $e) {
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
