<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;

class ContactFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('interlocutor', TextType::class, [
                'label' => 'contact.form.interlocutor',
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'default',
                'constraints' => [new NotBlank(['message' => 'contact.no_interlocutor'])],
            ])
            ->add('title', TextType::class, [
                'label' => 'contact.form.title',
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'default',
                'constraints' => [new NotBlank(['message' => 'contact.title'])],
            ])
            ->add('email', EmailType::class, [
                'label' => 'contact.form.email',
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
            ->add('body', TextType::class, [
                'label' => 'contact.form.body',
                'required' => true,
                'purify_html' => true,
                'purify_html_profile' => 'default',
                'attr' => [
                    'rows' => '10',
                    'cols' => '30',
                ],
                'constraints' => [new NotBlank(['message' => 'contact.no_body'])],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'translation_domain' => 'CapcoAppBundle',
            'csrf_protection' => false,
        ]);
    }
}
