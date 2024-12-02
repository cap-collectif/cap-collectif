<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Form\MediaResponseType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Form\ValueResponseType;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Validator\Constraints\PasswordComplexity;
use Capco\UserBundle\Entity\UserType;
use Infinite\FormBundle\Form\Type\PolyCollectionType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Valid;

class ApiRegistrationFormType extends AbstractType
{
    public function __construct(private readonly Manager $toggleManager)
    {
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        // disable password repeated
        $builder->remove('plainPassword')->add('plainPassword', PasswordType::class, [
            'constraints' => [new PasswordComplexity(), new NotBlank()],
        ]);
        $builder
            ->add('username', PurifiedTextType::class, [
                'required' => true,
                'purify_html' => true,
                'strip_tags' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('email', EmailType::class, ['required' => true])
            ->add('roles', CollectionType::class, ['entry_type' => TextType::class])
        ;

        $builder->add('captcha', CaptchaType::class, ['validation_groups' => ['registration']]);

        if ($this->toggleManager->isActive('user_type')) {
            $builder->add('userType', EntityType::class, [
                'required' => false,
                'class' => UserType::class,
            ]);
        }

        if ($this->toggleManager->isActive('zipcode_at_register')) {
            $builder->add('zipcode', null, ['required' => false]);
        }

        $builder
            ->add('consentInternalCommunication', CheckboxType::class, ['required' => false])
            ->add('consentExternalCommunication', CheckboxType::class, ['required' => false])
            ->add('responses', PolyCollectionType::class, [
                'allow_add' => true,
                'allow_delete' => false,
                'by_reference' => false,
                // Suppression d'index_property lors de l'inscription car il posait problème, pourquoi ? Seul le mystère nous le dira
                'types' => [ValueResponseType::class, MediaResponseType::class],
                'type_name' => AbstractResponse::TYPE_FIELD_NAME,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'constraints' => new Valid(),
            'validation_groups' => ['registration'],
        ]);
    }
}
