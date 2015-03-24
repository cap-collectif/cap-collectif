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
            ))
            ->add('email', 'email', array(
                'label' => 'contact.form.email',
            ))
            ->add('message', 'textarea', array(
                'label' => 'contact.form.message',
                'attr' => array(
                    'rows' => '10',
                    'cols' => '30',
                ),
            ))
        ;
    }

    public function getName()
    {
        return 'contact';
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $collectionConstraint = new Collection(array(
                'name'      => array(
                    new NotBlank(),
                ),
                'email'     => array(
                    new Email(),
                ),
                'message'   => array(
                    new NotBlank(),
                ),
            ));

        $resolver->setDefaults(array(
            'constraints' => $collectionConstraint,
            'translation_domain' => 'CapcoAppBundle',
        ));
    }
}
