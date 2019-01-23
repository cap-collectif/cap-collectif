<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\NotBlank;

class ContactType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', PurifiedTextType::class, [
                'label' => 'contact.form.name',
                'required' => true,
                'constraints' => [new NotBlank(['message' => 'contact.no_name'])],
            ])
            ->add('email', EmailType::class, [
                'label' => 'contact.form.email',
                'required' => true,
                'constraints' => [
                    new NotBlank(['message' => 'contact.no_email']),
                    new Email(['message' => 'global.constraints.email.invalid']),
                ],
            ])
            ->add('message', PurifiedTextareaType::class, [
                'label' => 'contact.form.message',
                'required' => true,
                'attr' => [
                    'rows' => '10',
                    'cols' => '30',
                ],
                'constraints' => [new NotBlank(['message' => 'contact.no_message'])],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }
}
