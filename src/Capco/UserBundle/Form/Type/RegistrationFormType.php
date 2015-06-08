<?php

namespace Capco\UserBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\SiteParameter\Resolver as SiteParameterResolver;

class RegistrationFormType extends AbstractType
{
    private $siteParameterResolver;
    private $toggleManager;

    public function __construct(SiteParameterResolver $resolver, Manager $toggleManager)
    {
        $this->siteParameterResolver = $resolver;
        $this->toggleManager = $toggleManager;
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

        if ($this->toggleManager->isActive('user_type')) {
            $builder->add('userType', null, array(
                'required' => false,
                'empty_value' => 'form.no_type',
                'translation_domain' => 'FOSUserBundle',
            ));
        }
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        // registration group is set by sonata
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
