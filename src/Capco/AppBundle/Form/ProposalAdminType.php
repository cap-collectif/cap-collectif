<?php

namespace Capco\AppBundle\Form;

use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;

class ProposalAdminType extends ProposalType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('author', EntityType::class, [
              'class' => 'CapcoUserBundle:User',
              'required' => true,
              'property' => 'id'
            ])
            ->add('childConnections', EntityType::class, [
                'multiple' => true,
                'class' => 'CapcoAppBundle:Proposal'
            ])
        ;

        parent::buildForm($builder, $options);
    }
}
