<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Proposal;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProposalProgressStepType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('progressSteps', CollectionType::class, [
            'entry_type' => ProgessStepType::class,
            'required' => true,
            'delete_empty' => true,
            'allow_add' => true,
            'allow_delete' => true,
            'by_reference' => false,
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Proposal::class,
            'validation_groups' => ['changeProgressSteps'],
            'csrf_protection' => false,
        ]);
    }
}
