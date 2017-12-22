<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Reply;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ReplyType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('responses', CollectionType::class, [
                'allow_add' => true,
                'allow_delete' => false,
                'by_reference' => false,
                'type' => ValueResponseType::class,
                'required' => false,
            ])
        ;

        if ($options['anonymousAllowed']) {
            $builder
                ->add('private', null, [
                    'required' => false,
                ])
            ;
        }
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Reply::class,
            'csrf_protection' => false,
            'cascade_validation' => true,
            'anonymousAllowed' => false,
        ]);
    }
}
