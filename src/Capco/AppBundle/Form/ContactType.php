<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Collection;

class ContactType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('name', 'text', array(
                'label' => 'contact.form.name',
                'required' => true,
                'constraints' => [new NotBlank(['message' => 'contact.no_name'])]
            ))
            ->add('email', 'email', array(
                'label' => 'contact.form.email',
                'required' => true,
                'constraints' => [new NotBlank(['message' => 'contact.no_email']), new Email(['checkMX' => true])]
            ))
            ->add('message', 'textarea', array(
                'label' => 'contact.form.message',
                'required' => true,
                'attr' => array(
                    'rows' => '10',
                    'cols' => '30',
                ),
                'constraints' => [new NotBlank(['message' => 'contact.no_message'])]
            ))
        ;
    }

    public function getName()
    {
        return 'contact';
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'translation_domain' => 'CapcoAppBundle',
        ));
    }
}
