<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\Type\RelayNodeType;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\Extension\Core\Type\MoneyType;
use Symfony\Component\Form\FormBuilderInterface;

class ProposalAdminType extends ProposalType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add(
                'author',
                RelayNodeType::class,
                ['class' => User::class],
                [
                    'required' => false,
                    'choice_label' => 'id',
                ]
            )
            ->add('estimation', MoneyType::class, [
                'currency' => 'EUR',
            ])
            ->add('likers', null, [
                'by_reference' => false,
            ])
        ;

        parent::buildForm($builder, $options);
    }
}
