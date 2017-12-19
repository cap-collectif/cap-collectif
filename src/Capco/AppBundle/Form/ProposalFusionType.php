<?php

namespace Capco\AppBundle\Form;

use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints as Assert;

class ProposalFusionType extends ProposalType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('childConnections', EntityType::class, [
                'multiple' => true,
                'class' => 'CapcoAppBundle:Proposal',
                'constraints' => [
                  new Assert\Count([
                    'min' => 2,
                    'minMessage' => 'You must specify more than 2 proposal',
                  ]),
                  // AssertProposalsAreFromSameProposalForm
                ],
            ])
        ;

        parent::buildForm($builder, $options);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Proposal::class,
            'csrf_protection' => false,
            'validation_groups' => ['create_fusion'],
            'cascade_validation' => true,
        ]);
    }
}
