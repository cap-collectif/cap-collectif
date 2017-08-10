<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProposalNotationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('estimation', MoneyType::class, [
              'currency' => 'EUR',
              'required' => false,
            ])
            ->add('likers', null, [
                // 'entry_type' => User::class,
                'required' => false,
                // 'allow_add' => true,
                // 'allow_delete' => true,
                // 'by_reference' => false,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\Proposal',
            'csrf_protection' => false,
        ]);
    }
}
