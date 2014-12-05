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
        $builder->add('name', 'text')
            ->add('email', 'email')
            ->add('message', 'textarea')
        ;
    }

    public function getName()
    {
        return 'contact';
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $collectionConstraint = new Collection(array(
                'name'      => new NotBlank(),
                'email'     => new Email(array('message' => 'Invalid email address')),
                'message'   => new NotBlank()
            ));

        $resolver->setDefaults(array('validation_constraint' => $collectionConstraint));
    }
}
