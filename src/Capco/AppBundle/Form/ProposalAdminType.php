<?php

namespace Capco\AppBundle\Form;

use Capco\UserBundle\Entity\User;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\Form\Type\RelayNodeType;

class ProposalAdminType extends ProposalType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add(
            'author',
            RelayNodeType::class,
            ['class' => User::class],
            [
                'required' => false,
                'choice_label' => 'id',
            ]
        );

        parent::buildForm($builder, $options);
    }
}
