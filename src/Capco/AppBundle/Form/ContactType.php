<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Media;
use Capco\UserBundle\Form\Type\CaptchaType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Count;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\NotBlank;

class ContactType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', TextType::class, [
                'label' => 'global.name',
                'required' => false,
                'constraints' => [],
            ])
            ->add('title', TextType::class, [
                'label' => 'contact.form.title',
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
                'constraints' => [new NotBlank(['message' => 'contact.title'])],
            ])
            ->add('email', EmailType::class, [
                'label' => 'global.email',
                'required' => true,
                'help' => 'global.email.format',
                'help_attr' => [
                    'id' => 'email-help',
                ],
                'attr' => [
                    'aria-describedby' => 'email-error email-help',
                ],
                'constraints' => [
                    new NotBlank(['message' => 'contact.no_email']),
                    new Email([
                        'message' => 'global.constraints.email.invalid',
                        'payload' => ['id' => 'email-error'],
                    ]),
                ],
            ])
            ->add('captcha', CaptchaType::class, ['validation_groups' => ['registration']])
            ->add('body', TextType::class, [
                'label' => 'contact.form.message',
                'required' => false,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
                'constraints' => [new NotBlank(['message' => 'contact.no_message'])],
            ])
            ->add('customCode', TextType::class, [
                'label' => 'contact.form.body',
                'required' => false,
                'constraints' => [new NotBlank(['message' => 'contact.no_body'])],
            ])
            ->add('metadatas', TextType::class, [
                'label' => 'contact.form.body',
                'required' => false,
                'purify_html' => false,
                'purify_html_profile' => 'admin',
                'constraints' => [new NotBlank(['message' => 'contact.no_body'])],
            ])
            ->add('socialMedias', EntityType::class, [
                'class' => Media::class,
                'multiple' => false,
                'required' => false,
                'constraints' => [
                    new Count([
                        'max' => 1,
                        'maxMessage' => 'You must add one file or none.',
                    ]),
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'translation_domain' => 'CapcoAppBundle',
            'csrf_protection' => false,
        ]);
    }
}
