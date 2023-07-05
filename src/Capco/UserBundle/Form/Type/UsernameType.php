<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

class UsernameType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('username', PurifiedTextType::class, [
            'strip_tags' => true,
            'required' => true,
            'purify_html' => true,
            'purify_html_profile' => 'admin',
        ]);
    }
}
