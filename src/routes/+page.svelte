<script lang="ts">
    export let data;
</script>

<h1>Lista ofert</h1>
<table class="table-auto">
    <thead>
        <tr>
            <th>Fotografia</th>
            <th>Data licytacji</th>
            <th>Kategoria</th>
            <th>Nazwa</th>
            <th>Miasto</th>
            <th>Cena wywołania</th>
            <th>Link do aukcji</th>
            <th>Link do szczegółów</th>
        </tr>
    </thead>
    <tbody>
        {#each data.listings as listing}
        <tr>
            <td>{listing.startDate}</td>
            <td>{listing.category}</td>
            <td>{listing.name}</td>
            <td>{listing.city}</td>
            <td>{listing.price}</td>
            <td><a href={listing.auctionUrl} target="_blank">Zobacz aukcję</a></td>
            <td><a href={listing.detailsUrl} target="_blank">Szczegóły</a></td>
        </tr>
        {/each}
    </tbody>
</table>