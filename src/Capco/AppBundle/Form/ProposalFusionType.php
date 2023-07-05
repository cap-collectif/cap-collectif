<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Proposal;
use Doctrine\ORM\EntityRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProposalFusionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title')
            ->add('body')
            ->add('childConnections', EntityType::class, [
                'multiple' => true,
                'class' => Proposal::class,
                // We make sure that all childs are from the same proposalForm
                'query_builder' => function (EntityRepository $er) use ($options) {
                    return $er
                        ->createQueryBuilder('p')
                        ->where('p.proposalForm = :form')
                        ->setParameter('form', $options['proposalForm'])
                    ;
                },
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Proposal::class,
            'csrf_protection' => false,
            'translation_domain' => false,
            'proposalForm' => null,
            'validation_groups' => false,
        ]);
    }
}
