<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\LogicJump;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class LogicJumpType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('id');
        $builder->add('always');
        $builder->add('origin');
        $builder->add('destination');
        $builder->add('conditions', CollectionType::class, [
            'allow_add' => true,
            'allow_delete' => true,
            'by_reference' => false,
            'entry_type' => LogicJumpConditionType::class,
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['csrf_protection' => false, 'data_class' => LogicJump::class]);
    }
}
