<?php

namespace Capco\AppBundle\Form\Type;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class RelayNodeType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->addEventListener(FormEvents::PRE_SUBMIT, function (FormEvent $formEvent) use (
            $options
        ) {
            $data = $formEvent->getData();
            $decodedData = null;

            if ($data) {
                if (true === $options['multiple']) {
                    $decodedData = array_map(function ($id) {
                        $id = GlobalIdResolver::getDecodedId($id);

                        return \is_array($id) ? $id['id'] : $id;
                    }, $data);
                } else {
                    $id = GlobalIdResolver::getDecodedId($data);
                    $decodedData = \is_array($id) ? $id['id'] : $id;
                }
            }
            $formEvent->setData($decodedData);
        });
    }

    public function getParent()
    {
        return EntityType::class;
    }
}
