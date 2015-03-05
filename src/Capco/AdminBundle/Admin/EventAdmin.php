<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Event;
use Geocoder\Provider\GoogleMaps;
use Ivory\HttpAdapter\CurlHttpAdapter;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class EventAdmin extends Admin
{

    protected $datagridValues = array(
        '_sort_order' => 'DESC',
        '_sort_by' => 'createdAt'
    );

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, array(
                'label' => 'admin.fields.event.title',
            ))
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $datagridMapper->add('Theme', null, array(
                'label' => 'admin.fields.event.themes',
            ));
        }

        $datagridMapper
            ->add('Author', null, array(
                'label' => 'admin.fields.event.author',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.event.is_enabled',
            ))
            ->add('isCommentable', null, array(
                'label' => 'admin.fields.event.is_commentable',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.event.updated_at',
            ))
            ->add('startAt', 'doctrine_orm_datetime_range', array(
                'label' => 'admin.fields.event.start_at',
            ))
            ->add('endAt', 'doctrine_orm_datetime_range', array(
                'label' => 'admin.fields.event.end_at',
            ))
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, array(
                'label' => 'admin.fields.event.title',
            ))
            ->add('startAt', null, array(
                'label' => 'admin.fields.event.start_at',
            ))
            ->add('endAt', null, array(
                'label' => 'admin.fields.event.end_at',
            ))
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $listMapper->add('Theme', null, array(
                'label' => 'admin.fields.event.themes',
            ));
        }

        $listMapper
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.event.author',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.event.is_enabled',
                'editable' => true,
            ))
            ->add('isCommentable', null, array(
                'label' => 'admin.fields.event.is_commentable',
                'editable' => true,
            ))
            ->add('commentsCount', null, array(
                'label' => 'admin.fields.event.comments_count',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.event.updated_at',
            ))
            ->add('_action', 'actions', array(
                'actions' => array(
                    'show' => array(),
                    'edit' => array(),
                    'delete' => array(),
                )
            ))
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        // define group zoning
        $formMapper
            ->with('admin.fields.event.group_event', array('class' => 'col-md-12'))->end()
            ->with('admin.fields.event.group_meta', array('class' => 'col-md-6'))->end()
            ->with('admin.fields.event.group_address', array('class' => 'col-md-6'))->end()
            ->end()
        ;

        $formMapper
            ->with('admin.fields.event.group_event')
            ->add('title', null, array(
                'label' => 'admin.fields.event.title',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.event.body',
                'attr' => array('class' => 'ckeditor'),
            ))
            ->add('Author', 'sonata_type_model', array(
                'label' => 'admin.fields.event.author',
            ))
            ->add('startAt', 'sonata_type_datetime_picker', array(
                'label' => 'admin.fields.event.start_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => array(
                    'data-date-format' => 'DD/MM/YYYY HH:mm'
                )
            ))
            ->add('endAt', 'sonata_type_datetime_picker', array(
                'label' => 'admin.fields.event.end_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => array(
                    'data-date-format' => 'DD/MM/YYYY HH:mm'
                ),
                'help' => 'admin.help.step.endAt',
            ))
            ->end()
            ->with('admin.fields.event.group_meta')
            ->add('link', 'url', array(
                'label' => 'admin.fields.event.link',
                'required' => false,
                'attr' => array(
                    'placeholder' => 'http://'
                ),
            ))
            ->add('Media', 'sonata_type_model_list', array(
                'label' => 'admin.fields.event.media',
                'required' => false,
            ), array(
                'link_parameters' => array(
                    'context' => 'default',
                    'hide_context' => true,
                    'provider' => 'sonata.media.provider.image',
                )
            ))
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $formMapper->add('Theme', 'sonata_type_model_list', array(
                'label' => 'admin.fields.event.themes',
                'required' => false,
            ));
        }

        $formMapper
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.event.is_enabled',
                'required' => false,
            ))
            ->add('isCommentable', null, array(
                'label' => 'admin.fields.event.is_commentable',
                'required' => false,
            ))
            ->end()
            ->with('admin.fields.event.group_address')
            ->add('address', null, array(
                'label' => 'admin.fields.event.address',
                'required' => false,
                'help' => 'admin.help.event.adress',
            ))
            ->add('zipCode', 'number', array(
                'label' => 'admin.fields.event.zipcode',
                'required' => false,
            ))
            ->add('city', null, array(
                'label' => 'admin.fields.event.city',
                'required' => false,
            ))
            ->add('country', null, array(
                'label' => 'admin.fields.event.country',
                'required' => false,
            ))
            ->end()
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();

        $showMapper
            ->add('title', null, array(
                'label' => 'admin.fields.event.title',
            ))
            ->add('body', null, array(
                'label' => 'admin.fields.event.body',
            ))
            ->add('startAt', null, array(
                'label' => 'admin.fields.event.start_at',
            ))
            ->add('endAt', null, array(
                'label' => 'admin.fields.event.end_at',
            ))
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $showMapper->add('Theme', null, array(
                'label' => 'admin.fields.event.themes',
            ));
        }

        $showMapper
            ->add('Author', null, array(
                'label' => 'admin.fields.event.author',
            ))
            ->add('Media', 'sonata_media_type', array(
                'template' => 'CapcoAdminBundle:Event:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'admin.fields.event.media',
            ))
            ->add('isEnabled', null, array(
                'label' => 'admin.fields.event.is_enabled',
            ))
            ->add('isCommentable', null, array(
                'label' => 'admin.fields.event.is_commentable',
            ))
            ->add('commentsCount', null, array(
                'label' => 'admin.fields.event.comments_count',
            ))
            ->add('updatedAt', null, array(
                'label' => 'admin.fields.event.updated_at',
            ))
            ->add('createdAt', null, array(
                'label' => 'admin.fields.event.created_at',
            ))
            ->add('address', null, array(
                'label' => 'admin.fields.event.address',
            ))
            ->add('zipCode', 'number', array(
                'label' => 'admin.fields.event.zipcode',
            ))
            ->add('city', null, array(
                'label' => 'admin.fields.event.city',
            ))
            ->add('country', null, array(
                'label' => 'admin.fields.event.country',
            ))
            ->add('lat', null, array(
                'label' => 'admin.fields.event.lat',
            ))
            ->add('lng', null, array(
                'label' => 'admin.fields.event.lng',
            ))

        ;
    }

    public function getFeatures()
    {
        return array(
            'calendar',
        );
    }

    public function prePersist($event)
    {
        $this->setCoord($event);
    }

    public function preUpdate($event)
    {
        $this->setCoord($event);
    }

    private function setCoord(Event $event)
    {
        if (!$event->getAddress() || !$event->getCity()) {
            $event->setLat(null);
            $event->setLng(null);
            return;
        }

        $curl = new CurlHttpAdapter();
        $geocoder = new GoogleMaps($curl);

        $address = $event->getAddress().', '.$event->getZipCode().' '.$event->getCity().', '.$event->getCountry();

        $coord = $geocoder->geocode($address)->first()->getCoordinates();

        $event->setLat($coord->getLatitude());
        $event->setLng($coord->getLongitude());

    }


}
