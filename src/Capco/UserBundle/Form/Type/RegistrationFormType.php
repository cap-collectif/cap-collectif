<?php

namespace Capco\UserBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Capco\AppBundle\SiteParameter\Resolver as SiteParameterResolver;

class RegistrationFormType extends AbstractType
{
    private $siteParameterResolver;

    public function __construct(SiteParameterResolver $resolver)
    {
        $this->siteParameterResolver = $resolver;
    }
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ((null != $this->siteParameterResolver->getValue('signin.cgu.name')) && (null != $this->siteParameterResolver->getValue('signin.cgu.link'))) {
            $builder->add('isTermsAccepted', 'checkbox', array(
                'label' => null,
                'required' => true,
            ));
        } else {
            $builder->add('isTermsAccepted', 'hidden', array(
                'data' => true,
                'property_path' => 'isTermsAccepted',
            ));
        }

        $builder
            ->remove('plainPassword')
            ->add('plainPassword', 'password', array(
                'translation_domain' => 'FOSUserBundle',
                'label' => 'form.password',
            ))
        ;
    }

    public function getParent()
    {
        return 'sonata_user_registration';
    }

    public function getName()
    {
        return 'capco_user_registration';
    }
}
