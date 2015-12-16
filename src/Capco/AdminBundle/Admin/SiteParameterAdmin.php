<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\SiteParameter;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class SiteParameterAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by'    => 'isEnabled',
    ];

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->add('isEnabled', null, [
                'label'    => 'admin.fields.site_parameter.is_enabled',
                'required' => false,
            ])
        ;

        $subject = $this->getSubject();
        $types = SiteParameter::$types;

        if ($subject->getType() == $types['simple_text']) {
            $formMapper->add('value', 'text', [
                    'label'    => 'admin.fields.site_parameter.value',
                    'required' => false,
                ]);
        } elseif ($subject->getType() == $types['rich_text']) {
            $formMapper->add('value', 'ckeditor', [
                'label'       => 'admin.fields.site_parameter.value',
                'required'    => false,
                'config_name' => 'admin_editor',
            ]);
        } elseif ($subject->getType() == $types['integer']) {
            $formMapper->add('value', 'integer', [
                'label'    => 'admin.fields.site_parameter.value',
                'required' => false,
            ]);
        } elseif ($subject->getType() == $types['javascript']) {
            $formMapper->add('value', 'textarea', [
                'label'    => 'admin.fields.site_parameter.value',
                'required' => false,
                'help'     => 'admin.help.site_parameter.js',
                'attr'     => ['rows' => 10, 'placeholder' => '<script type="text/javascript"> </script>'],
            ]);
        } elseif ($subject->getType() == $types['email']) {
            $formMapper->add('value', 'email', [
                'label'    => 'admin.fields.site_parameter.value',
                'required' => false,
                'attr'     => ['placeholder' => 'hello@exemple.com'],
            ]);
        } elseif ($subject->getType() == $types['intern_url']) {
            $formMapper->add('value', null, [
                'label'    => 'admin.fields.site_parameter.value',
                'required' => false,
            ]);
        } elseif ($subject->getType() == $types['url']) {
            $formMapper->add('value', 'url', [
                'label'    => 'admin.fields.site_parameter.value',
                'required' => false,
            ]);
        } elseif ($subject->getType() == $types['tel']) {
            $formMapper->add('value', null, [
                'label'    => 'admin.fields.site_parameter.value',
                'required' => false,
            ]);
        } elseif ($subject->getType() == $types['boolean']) {
            $formMapper->add('value', 'choice', [
                'label'    => 'admin.fields.site_parameter.value',
                'required' => false,
                'choices'  => ['1' => 'Activé', '0' => 'Désactivé'],
            ]);
        } else {
            $formMapper->add('value', null, [
                'label'    => 'admin.fields.site_parameter.value',
                'required' => false,
            ]);
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['edit']);
    }

    public function toString($object)
    {
        if (!is_object($object)) {
            return '';
        }

        if (method_exists($object, '__toString') && null !== $object->__toString()) {
            return $this->getConfigurationPool()->getContainer()->get('translator')->trans((string) $object, [], 'CapcoAdminParameters');
        }

        return parent::toString($object);
    }
}
