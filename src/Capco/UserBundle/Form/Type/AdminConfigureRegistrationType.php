<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Form\TranslationCollectionType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Capco\AppBundle\Entity\RegistrationForm;

class AdminConfigureRegistrationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('translations', TranslationCollectionType::class, [
                'fields' => ['id', 'locale', 'topText', 'bottomText'],
            ])
            ->add('domains', CollectionType::class, [
                'allow_add' => true,
                'allow_delete' => true,
                'entry_type' => EmailDomainType::class,
                'by_reference' => false,
                'required' => false,
            ])
            ->add('bottomTextDisplayed', null, ['required' => false])
            ->add('bottomText', null, ['required' => false])
            ->add('topTextDisplayed', null, ['required' => false])
            ->add('topText', null, ['required' => false]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => RegistrationForm::class,
        ]);
    }
}
