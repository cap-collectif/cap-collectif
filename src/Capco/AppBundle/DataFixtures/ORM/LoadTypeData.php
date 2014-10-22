<?php

namespace Capco\AppBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;

use Model\Type;

class LoadTypeData implements FixtureInterface
{
    public function load(ObjectManager $manager)
    {

        $types = array(
            array('Problème', 1),
            array('Enjeux', 3),
            array('Solution', 4),
            array('Cause', 2),
        );

        foreach ($types as $i => $type) {
            $liste_type[$i] = new Type();
            $liste_type[$i]->setTitle($type[0]);
            $liste_type[$i]->setWeight($type[1]);

            $manager->persist($liste_type[$i]);
        }

        $manager->flush();

    }
}
