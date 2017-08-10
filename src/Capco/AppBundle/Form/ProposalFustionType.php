<?php

namespace Capco\AppBundle\Form;

use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints as Assert;

class ProposalFustionType extends ProposalType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('author', EntityType::class, [
              'class' => 'CapcoUserBundle:User',
              'required' => true,
              'property' => 'id',
            ])
            ->add('childConnections', EntityType::class, [
                'multiple' => true,
                'class' => 'CapcoAppBundle:Proposal',
                'constraints' => [
                  new Assert\Count([
                    'min' => 2,
                    'minMessage' => 'You must specify more than 2 proposal',
                  ]),
                ],
            ])
        ;

        parent::buildForm($builder, $options);
    }
}
