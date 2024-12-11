const Hubspot = require('@hubspot/api-client');

class HubspotService {
  constructor() {
    if (!process.env.HUBSPOT_ACCESS_TOKEN) {
      throw new Error('HUBSPOT_ACCESS_TOKEN is not defined in environment variables');
    }
    this.client = new Hubspot.Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
  }

  /**
   * Create a new contact in HubSpot.
   * @param {Object} customerData - The customer data to create.
   * @returns {string} - The HubSpot contact ID.
   */
  async createContact(customerData) {
    try {
      const [firstname, ...lastnameParts] = customerData.name.split(' ');
      const lastname = lastnameParts.join(' ');

      const contactObj = {
        properties: {
          email: customerData.email,
          firstname: firstname || customerData.name, 
          lastname: lastname || '', 
          phone: customerData.phone,
        },
      };
      const response = await this.client.crm.contacts.basicApi.create(contactObj);
      console.log('Full HubSpot Response:', response); 
      console.log('HubSpot Contact Created:', response);
      return response.id;
    } catch (error) {
      console.error('Error creating HubSpot contact:', error.response ? JSON.stringify(error.response.body, null, 2) : error.message);
      throw error;
    }
  }

  /**
   * Retrieve a contact from HubSpot by email.
   * @param {string} email - The contact's email.
   * @returns {Object|null} - Contact object from HubSpot or null if not found.
   */
  async getContactByEmail(email) {
    try {
      const filter = { propertyName: 'email', operator: 'EQ', value: email };
      const filterGroup = { filters: [filter] };
      const publicObjectSearchRequest = {
        filterGroups: [filterGroup],
        properties: ['email', 'firstname', 'lastname', 'phone'],
        limit: 1,
      };
      const response = await this.client.crm.contacts.searchApi.doSearch(publicObjectSearchRequest);
      
      console.log('Search API Response:', JSON.stringify(response, null, 2));
      
      const contact = response.results[0] || null;
      console.log('HubSpot Contact Retrieved:', contact);
      return contact;
    } catch (error) {
      console.error('Error retrieving HubSpot contact:', error.response ? JSON.stringify(error.response.body, null, 2) : error.message);
      throw error;
    }
  }

  /**
   * Retrieve a contact from HubSpot by ID.
   * @param {string} contactId - The HubSpot contact ID.
   * @returns {Object|null} - Contact object from HubSpot or null if not found.
   */
  async getContactById(contactId) {
    try {
      const response = await this.client.crm.contacts.basicApi.getById(contactId, ['email', 'firstname', 'lastname', 'phone']);
      console.log('HubSpot Contact Retrieved by ID:', response);
      return response;
    } catch (error) {
      console.error('Error retrieving HubSpot contact by ID:', error.response ? JSON.stringify(error.response.body, null, 2) : error.message);
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update a contact in HubSpot.
   * @param {string} contactId - The HubSpot contact ID.
   * @param {Object} updateData - The data to update.
   * @returns {Object} - Updated contact object from HubSpot.
   */
  async updateContact(contactId, updateData) {
    try {
      // Split the full name into firstname and lastname
      const [firstname, ...lastnameParts] = updateData.name.split(' ');
      const lastname = lastnameParts.join(' ');
  
      const contactObj = {
        properties: {
          firstname: firstname || updateData.name,
          lastname: lastname || '',
          email: updateData.email,
          phone: updateData.phone,
        },
      };
      const response = await this.client.crm.contacts.basicApi.update(contactId, contactObj);
      console.log('HubSpot Contact Updated:', response);
      return response;
    } catch (error) {
      console.error('Error updating HubSpot contact:', error.response ? JSON.stringify(error.response.body, null, 2) : error.message);
      throw error;
    }
  }

  /**
   * Delete a contact from HubSpot.
   * @param {string} contactId - The HubSpot contact ID.
   * @returns {void}
   */
  async deleteContact(contactId) {
    try {
      await this.client.crm.contacts.basicApi.archive(contactId);
      console.log(`HubSpot Contact with ID ${contactId} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting HubSpot contact:', error.response ? JSON.stringify(error.response.body, null, 2) : error.message);
      throw error;
    }
  }

  /**
   * Fetch all contacts from HubSpot with pagination.
   * @param {number} limit - Number of records per page.
   * @param {number} after - Pagination token.
   * @returns {Object} - Paginated contact data from HubSpot.
   */
  async getAllContacts(limit = 100, after = undefined) {
    try {
      const properties = ['email', 'firstname', 'lastname', 'phone'];
      const response = await this.client.crm.contacts.basicApi.getPage(limit, after, properties);
      console.log('HubSpot Contacts Fetched:', response.results.length);
      return response;
    } catch (error) {
      console.error('Error fetching HubSpot contacts:', error.response ? JSON.stringify(error.response.body, null, 2) : error.message);
      throw error;
    }
  }
  
}

module.exports = new HubspotService();
