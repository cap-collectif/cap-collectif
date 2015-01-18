<?php

namespace Capco\UserBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

class ProfileFormType extends AbstractType
{

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('twitterName', null, array(
                'label'    => 'Twitter',
                'required' => false
            ))
            ->add('facebookName', null, array(
                'label'    => 'Facebook',
                'required' => false
            ))
            ->add('gplusName', null, array(
                'label'    => 'Google +',
                'required' => false
            ))
            ->add('username', null, array(
                'label'    => 'Nom',
                'required' => true
            ))
            ->add('media', 'sonata_media_type', array(
                'provider' => 'sonata.media.provider.image',
                'context' => 'default',
                'required' => false,
                'label' => 'Image'
            ))
            ->remove('lastname')
            ->remove('firstname')
        ;
    }

    public function getParent()
    {
        return 'sonata_user_profile';
    }

    public function getName()
    {
        return 'capco_user_profile';
    }
}
