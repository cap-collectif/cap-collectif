<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Proposal;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class ProposalFusionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('childConnections', EntityType::class, [
                'multiple' => true,
                'class' => Proposal::class,
                'constraints' => [
                  new Assert\Count([
                    'groups' => ['CreateFusion'],
                    'min' => 2,
                    'minMessage' => 'You must specify at least 2 proposals to merge.',
                    'max' => 100,
                    'maxMessage' => 'You cannot specify more than 100 proposals to merge.',
                  ]),
                  // TODO AssertProposalsAreFromSameProposalForm
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
            'translation_domain' => false,
            'validation_groups' => ['CreateFusion'],
            'cascade_validation' => true,
        ]);
    }
}
