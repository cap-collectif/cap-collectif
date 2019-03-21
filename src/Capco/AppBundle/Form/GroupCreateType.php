<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class GroupCreateType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('title', PurifiedTextType::class, ['required' => true]);
        $builder->add('description', PurifiedTextType::class, ['required' => false]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => Group::class,
        ]);
    }
}
